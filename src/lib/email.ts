import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "DevStash <onboarding@resend.dev>";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function brandedEmail({
  heading,
  body,
  ctaUrl,
  ctaLabel,
  footer,
}: {
  heading: string;
  body: string;
  ctaUrl: string;
  ctaLabel: string;
  footer: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="margin-bottom: 24px;">
        <div style="display: inline-block; width: 36px; height: 36px; background-color: #3b82f6; border-radius: 8px; text-align: center; line-height: 36px; font-size: 16px; font-weight: 700; color: #ffffff;">D</div>
        <span style="font-size: 18px; font-weight: 700; color: #18181b; margin-left: 8px; vertical-align: middle;">DevStash</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 600; color: #18181b; margin-bottom: 8px;">
        ${heading}
      </h2>
      <p style="font-size: 14px; color: #52525b; line-height: 1.6; margin-bottom: 24px;">
        ${body}
      </p>
      <a href="${ctaUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
        ${ctaLabel}
      </a>
      <p style="font-size: 12px; color: #a1a1aa; margin-top: 32px; line-height: 1.5;">
        ${footer}
      </p>
    </div>
  `;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your DevStash email",
    html: brandedEmail({
      heading: "Verify your email address",
      body: "Click the button below to verify your email and activate your account. This link expires in 24 hours.",
      ctaUrl: verifyUrl,
      ctaLabel: "Verify Email",
      footer: "If you didn't create a DevStash account, you can safely ignore this email.",
    }),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your DevStash password",
    html: brandedEmail({
      heading: "Reset your password",
      body: "Click the button below to reset your password. This link expires in 24 hours.",
      ctaUrl: resetUrl,
      ctaLabel: "Reset Password",
      footer: "If you didn't request a password reset, you can safely ignore this email.",
    }),
  });
}
