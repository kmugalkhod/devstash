import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@dodopayments/core/checkout";

type Plan = "monthly" | "yearly";

function productIdForPlan(plan: Plan): string | undefined {
  return plan === "yearly"
    ? process.env.DODO_PRODUCT_ID_YEARLY
    : process.env.DODO_PRODUCT_ID_MONTHLY;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let plan: Plan = "monthly";
  try {
    const body = (await request.json()) as { plan?: Plan };
    if (body.plan === "yearly" || body.plan === "monthly") plan = body.plan;
  } catch {
    // empty body is fine; default to monthly
  }

  const productId = productIdForPlan(plan);
  if (!productId) {
    return NextResponse.json(
      { error: "Pro plan is not configured" },
      { status: 500 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, dodoCustomerId: true },
  });
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const checkout = await createCheckoutSession(
      {
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: user.dodoCustomerId
          ? { customer_id: user.dodoCustomerId }
          : { email: user.email, name: user.name ?? undefined },
        return_url: process.env.DODO_PAYMENTS_RETURN_URL,
        metadata: {
          userId: session.user.id,
          plan,
        },
      },
      {
        bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
        environment: process.env.DODO_PAYMENTS_ENVIRONMENT as
          | "test_mode"
          | "live_mode"
          | undefined,
      }
    );

    return NextResponse.json({ checkout_url: checkout.checkout_url });
  } catch (error) {
    console.error("Dodo checkout session error", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
