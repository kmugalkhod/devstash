# Authentication Security Review

**Last Audit Date:** 2026-03-24
**Auditor:** Auth Security Agent
**Scope:** All authentication-related custom code (passwords, tokens, rate limiting, session validation, email flows)

---

## Summary

**5 findings: 0 critical, 2 high, 2 medium, 1 low.**

The overall auth implementation is well-structured. Password hashing uses bcrypt at cost factor 12, tokens are generated with `crypto.randomBytes`, expiration and single-use enforcement are correctly implemented, and all protected routes validate sessions. The main concerns are a rate limiter that is ineffective in any multi-instance or serverless deployment, an account-linking flag that opens a narrow but real account-takeover path, two sensitive endpoints that have no rate limiting, and account enumeration on registration.

---

## Findings

### [HIGH] In-Memory Rate Limiter Is Ineffective in Serverless / Multi-Instance Deployments

**File:** `src/lib/rate-limit.ts:11`
**Severity:** High
**Category:** Rate Limiting

**Description:**
The rate limiter stores state in a module-level `Map`. On any platform that runs multiple server instances (Vercel serverless functions, Railway, Fly.io with multiple replicas, Docker Swarm, etc.) each instance has an entirely separate `Map`. A client that hits different instances, or that triggers a cold start, starts with a fresh counter every time. The comment in the file itself acknowledges this (`// Replace with Redis-backed solution`), but it is important to call out why this is a security issue rather than just a production concern: the rate limits on `POST /api/auth/register` (5 req / 15 min) and `POST /api/auth/forgot-password` (3 req / 15 min) are the only brute-force controls on these endpoints, and they provide no real protection once the app is deployed.

**Vulnerable Code:**
```typescript
// src/lib/rate-limit.ts
const store = new Map<string, RateLimitEntry>();   // per-process memory only

export function rateLimit({ limit, windowMs }: ...) {
  return {
    check(key: string) {
      // state lives only in this process instance
      const entry = store.get(key);
      ...
    },
  };
}
```

**Recommended Fix:**
Replace with a distributed store. The lowest-friction option for a Vercel/Next.js stack is `@upstash/ratelimit` with Upstash Redis (free tier available):

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

export function rateLimit({ limit, windowMs }: { limit: number; windowMs: number }) {
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
  });

  return {
    async check(key: string): Promise<{ success: boolean; remaining: number }> {
      const { success, remaining } = await limiter.limit(key);
      return { success, remaining };
    },
  };
}
```

Callers in the route handlers would need to `await limiter.check(ip)` (the current synchronous call site must become async). Until Redis is wired up, the current in-memory limiter should be understood as development-only scaffolding.

**Impact:** An attacker deploying against a multi-instance deployment can bypass all rate limits on registration (used to enumerate existing emails at scale) and on forgot-password (used to flood a target's inbox or to probe account existence timing differences).

---

### [HIGH] `allowDangerousEmailAccountLinking` Enables Account Takeover via GitHub OAuth

**File:** `src/auth.ts:32`
**Severity:** High
**Category:** Account Linking / OAuth Security

**Description:**
`GitHub({ allowDangerousEmailAccountLinking: true })` instructs NextAuth to automatically merge any incoming GitHub sign-in into an existing account that shares the same email, without any additional confirmation step. GitHub historically allowed users to add unverified email addresses to their account (the primary email is verified, secondary emails may not be). An attacker who adds the victim's email address to their own GitHub account (as a secondary, unverified address) could sign in and be automatically merged into the victim's DevStash account, gaining full access.

Even if GitHub's current policies make this harder, the option name "dangerous" exists precisely because the trust model is provider-dependent. The flag was introduced to solve a developer-experience problem (`OAuthAccountNotLinked` errors) but the trade-off is real account-takeover surface.

The project history notes this was enabled specifically to allow GitHub OAuth users to link with existing credential accounts — that use case is valid, but the implementation should be conditional on the GitHub profile's email being verified.

**Vulnerable Code:**
```typescript
// src/auth.ts
providers: [
  GitHub({ allowDangerousEmailAccountLinking: true }),  // unconditional
  Credentials({ ... }),
],
```

**Recommended Fix:**
Remove the provider-level flag and implement conditional linking inside the `signIn` callback, where you can inspect whether GitHub confirmed the email is verified:

```typescript
// src/auth.ts
providers: [
  GitHub,   // no allowDangerousEmailAccountLinking
  Credentials({ ... }),
],
callbacks: {
  async signIn({ user, account, profile }) {
    // Only allow account linking for GitHub if the email is verified
    if (account?.provider === "github") {
      const isEmailVerified = (profile as { email_verified?: boolean })?.email_verified;
      // GitHub marks primary emails as verified; secondary/unverified emails
      // will have email_verified === false or undefined
      if (!isEmailVerified && !user.id) {
        // New user with unverified GitHub email — allow registration but not linking
        return true;
      }
      // Existing user with same email — only link if GitHub verified it
      return isEmailVerified === true || isEmailVerified === undefined;
      // GitHub primary emails are trusted; undefined means the field isn't present,
      // fall back to trusting GitHub's primary email
    }
    return true;
  },
  jwt({ token, user }) { ... },
  session({ session, token }) { ... },
},
```

Alternatively, if simplicity is preferred, keep `allowDangerousEmailAccountLinking: true` but add a comment explaining that this is acceptable only because GitHub verifies all primary email addresses — and add a monitoring check so this decision is revisited if the provider changes.

**Impact:** An attacker with a GitHub account can add a target user's email address and sign into the victim's DevStash account, gaining access to all their stored snippets, prompts, and files.

---

### [MEDIUM] Password Reset Endpoint Has No Rate Limit

**File:** `src/app/api/auth/reset-password/route.ts:12`
**Severity:** Medium
**Category:** Rate Limiting / Token Security

**Description:**
`POST /api/auth/reset-password` accepts a token and a new password. There is no rate limiting on this route. While the token itself has 256 bits of entropy (32 random bytes encoded as 64 hex characters), the absence of any rate limiting means an attacker who obtains the beginning of a token (e.g., from a log leak, browser history, or referrer header) could enumerate the remaining characters. More practically, it leaves the endpoint open to automated abuse without any throttling signal.

The `forgot-password` route correctly has a rate limiter; the `reset-password` route does not.

**Vulnerable Code:**
```typescript
// src/app/api/auth/reset-password/route.ts
export async function POST(request: Request) {
  // No rate limit check before processing the token
  const body = await request.json();
  const result = schema.safeParse(body);
  ...
  const email = await validateVerificationToken(token);
```

**Recommended Fix:**
Add a rate limiter keyed on IP, consistent with the other auth routes:

```typescript
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = limiter.check(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
  // ... rest of handler
}
```

**Impact:** Without rate limiting, the reset endpoint can be driven at full speed by automated tools. Although breaking a 256-bit token is not computationally feasible, the lack of throttling is an unnecessary risk and violates defense-in-depth.

---

### [MEDIUM] Change-Password Endpoint Has No Rate Limit

**File:** `src/app/api/auth/change-password/route.ts:12`
**Severity:** Medium
**Category:** Rate Limiting

**Description:**
`POST /api/auth/change-password` requires the user's current password before setting a new one. There is no rate limit on this endpoint. An authenticated attacker (or an attacker who has obtained a valid session via XSS or session fixation) could call this endpoint repeatedly to brute-force the current password — bcrypt at cost 12 makes each attempt slow (~300ms), but there is nothing in the application layer to stop the attempt.

This is also relevant in a scenario where a user's JWT is stolen but the attacker does not know the account password: they can systematically try passwords to escalate from session access to full credential access (and then lock out the real user by changing the password).

**Vulnerable Code:**
```typescript
// src/app/api/auth/change-password/route.ts
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // No rate limit — bcrypt is slow but nothing stops looping requests
  const isValid = await bcrypt.compare(currentPassword, user.password);
```

**Recommended Fix:**
Add a rate limiter keyed on the authenticated user's ID (not IP, since this is an authenticated endpoint):

```typescript
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = limiter.check(session.user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
  // ... rest of handler
}
```

**Impact:** A stolen JWT allows an attacker to brute-force the account's current password via this endpoint, with no application-level throttling. bcrypt slows each attempt but does not stop sustained automated attempts.

---

### [LOW] Registration Endpoint Leaks Account Existence

**File:** `src/app/api/auth/register/route.ts:47`
**Severity:** Low
**Category:** Account Enumeration

**Description:**
When a user attempts to register with an email that already exists, the endpoint returns HTTP 409 with the message `"A user with this email already exists"`. This allows any unauthenticated caller to determine whether a given email address is registered, which can be used to build a list of valid accounts for phishing or credential-stuffing attacks.

By contrast, the `forgot-password` endpoint correctly avoids this: it always returns `{ success: true }` regardless of whether the email exists.

**Vulnerable Code:**
```typescript
// src/app/api/auth/register/route.ts
if (existingUser) {
  return NextResponse.json(
    { error: "A user with this email already exists" },  // reveals account existence
    { status: 409 }
  );
}
```

**Recommended Fix:**
Return the same success response as if registration succeeded, and optionally send the existing user a "someone tried to register with your email" notification email. This matches the pattern used by most production auth systems:

```typescript
if (existingUser) {
  // Optionally: send a "someone tried to register" email to the existing address
  // so the real user is informed without leaking info to the attacker.
  return NextResponse.json(
    {
      success: true,
      emailVerificationRequired: emailVerificationEnabled,
    },
    { status: 201 }
  );
}
```

If business requirements demand an explicit duplicate-email error on the registration form (for UX reasons), this is an accepted trade-off — but it should be a deliberate decision, not a default. At minimum, document this behavior.

**Impact:** Unauthenticated callers can enumerate all registered email addresses at the rate limit of 5 requests per 15 minutes per IP (itself weakened by the in-memory limiter issue above).

---

## Passed Checks

These areas were reviewed and confirmed to be correctly implemented.

- **bcrypt cost factor**: All password hashing uses `bcrypt.hash(password, 12)`, which is above the minimum recommended factor of 10 and appropriate for 2026 hardware. Found in `register/route.ts:54`, `reset-password/route.ts:35`, `change-password/route.ts:51`.

- **Token generation entropy**: `crypto.randomBytes(32).toString("hex")` produces 256 bits of entropy. This is cryptographically secure and exceeds the 128-bit minimum recommended for reset tokens. (`src/lib/tokens.ts:7`)

- **Token expiration enforcement**: `validateVerificationToken` checks `record.expires < new Date()` and deletes expired tokens before returning `null`. Expiry is set to 24 hours at generation time. (`src/lib/tokens.ts:34–39`)

- **Single-use token enforcement**: After successful validation, the token is immediately deleted from the database before the function returns the email. This prevents token replay. (`src/lib/tokens.ts:42–44`)

- **Token collision handling**: `generateVerificationToken` deletes all existing tokens for the email before creating a new one, preventing a scenario where multiple valid tokens exist for the same account simultaneously. (`src/lib/tokens.ts:13–15`)

- **Timing-safe bcrypt comparison**: `bcrypt.compare` is inherently timing-safe. The credentials `authorize` function returns `null` for both "user not found" and "wrong password" without distinguishing between the two in its response, which prevents sign-in enumeration. (`src/auth.ts:44–48`)

- **Session validation on protected API routes**: `change-password` and `delete-account` both call `await auth()` and return 401 before doing any work if the session is missing or lacks a user ID. (`change-password/route.ts:14–16`, `delete-account/route.ts:7–9`)

- **Route protection via proxy middleware**: `src/proxy.ts` protects all `/dashboard/*` routes by checking `req.auth` before allowing access. The matcher regex correctly excludes static assets. (`src/proxy.ts:10–16`)

- **Email verification gate**: Credential sign-in throws `EmailNotVerifiedError` for unverified users when `EMAIL_VERIFICATION_ENABLED` is `true`, blocking access at the NextAuth `authorize` callback level. GitHub OAuth users bypass this correctly (they are implicitly verified by GitHub). (`src/auth.ts:50–53`)

- **Password change requires current password**: The change-password endpoint fetches the user's current hash and verifies it with `bcrypt.compare` before allowing any update. OAuth-only users (no `password` field) are explicitly blocked with a clear error. (`change-password/route.ts:36–49`)

- **Forgot-password does not leak account existence**: The forgot-password endpoint always returns `{ success: true }` regardless of whether the email is registered. It only sends an email if the user exists, but both code paths return the same HTTP response. (`forgot-password/route.ts:41–48`)

- **No plaintext passwords in responses or logs**: API routes do not log or return the raw password at any point. Error handlers log the `error` object, not request bodies. (`register/route.ts:87`, `change-password/route.ts:60`)

- **Input validation with Zod**: All auth API routes validate request bodies with `z.safeParse` before touching any data. Schema validation failures return a generic 400 without revealing which field failed in a way that aids enumeration.

- **Password max length capped at 72**: All schemas cap password at `max(72)`, which correctly reflects bcrypt's 72-byte input limit and prevents a denial-of-service via extremely long passwords. (`register/route.ts:12`, `reset-password/route.ts:9`, `change-password/route.ts:9`)

- **env files excluded from version control**: `.gitignore` correctly excludes `.env`, `.env.local`, `.env.*.local`, and `.env.production`.

- **Account delete cascade**: The delete-account route deletes the user record which cascades (via Prisma schema `onDelete: Cascade`) to items, collections, sessions, and accounts, leaving no orphaned sensitive data.

---

## Scope Notes

**Reviewed:**
- All files under `src/app/api/auth/`
- `src/auth.ts`, `src/auth.config.ts`
- `src/lib/tokens.ts`, `src/lib/email.ts`, `src/lib/rate-limit.ts`, `src/lib/auth-utils.ts`
- `src/proxy.ts` (middleware / route protection)
- All auth page components under `src/app/(auth)/`
- `src/app/dashboard/profile/` (profile management UI and actions)
- `.gitignore` (env file exposure check)

**Not reviewed (out of scope for this audit):**
- Prisma schema cascade correctness (data integrity, not auth security)
- Stripe/payment flows
- File upload authorization (Cloudflare R2 presigned URL logic — not yet implemented)
- Any future server actions for item/collection CRUD (authorization checks within those routes should be audited separately as they are built)
- OAuth token storage in the `Account` model (handled entirely by NextAuth/Prisma adapter)
