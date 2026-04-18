import { Webhooks } from "@dodopayments/nextjs";
import { prisma } from "@/lib/prisma";

type SubscriptionData = {
  payload_type: "Subscription";
  status: string;
  subscription_id: string;
  product_id: string;
  next_billing_date: Date | string;
  customer: { customer_id: string; email: string };
  metadata: Record<string, unknown>;
};

function getUserIdFromMetadata(metadata: Record<string, unknown>): string | null {
  const v = metadata?.userId;
  return typeof v === "string" && v.length > 0 ? v : null;
}

async function resolveUserId(data: SubscriptionData): Promise<string | null> {
  const fromMetadata = getUserIdFromMetadata(data.metadata ?? {});
  if (fromMetadata) return fromMetadata;

  const byCustomer = await prisma.user.findUnique({
    where: { dodoCustomerId: data.customer.customer_id },
    select: { id: true },
  });
  if (byCustomer) return byCustomer.id;

  if (data.customer.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: data.customer.email },
      select: { id: true },
    });
    if (byEmail) return byEmail.id;
  }
  return null;
}

function planFromProductId(productId: string): string | null {
  if (productId === process.env.DODO_PRODUCT_ID_YEARLY) return "yearly";
  if (productId === process.env.DODO_PRODUCT_ID_MONTHLY) return "monthly";
  return null;
}

async function activateSubscription(data: SubscriptionData): Promise<void> {
  const userId = await resolveUserId(data);
  if (!userId) {
    console.warn("[dodo webhook] user not found for subscription", {
      subscriptionId: data.subscription_id,
      customerId: data.customer.customer_id,
    });
    return;
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      isPro: true,
      dodoCustomerId: data.customer.customer_id,
      dodoSubscriptionId: data.subscription_id,
      proPlan: planFromProductId(data.product_id),
      proExpiresAt: new Date(data.next_billing_date),
    },
  });
}

async function deactivateSubscription(data: SubscriptionData): Promise<void> {
  const userId = await resolveUserId(data);
  if (!userId) return;
  await prisma.user.update({
    where: { id: userId },
    data: {
      isPro: false,
      proExpiresAt: null,
      proPlan: null,
    },
  });
}

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,

  onPayload: async (payload) => {
    console.log("[dodo webhook] event received", {
      type: (payload as { type?: string }).type,
      payload_type: (payload as { data?: { payload_type?: string } }).data?.payload_type,
    });
  },

  onSubscriptionActive: async (payload) => {
    console.log("[dodo webhook] subscription.active", {
      subscription_id: (payload.data as SubscriptionData).subscription_id,
      customer_id: (payload.data as SubscriptionData).customer.customer_id,
      metadata: (payload.data as SubscriptionData).metadata,
    });
    await activateSubscription(payload.data as SubscriptionData);
  },
  onSubscriptionRenewed: async (payload) => {
    await activateSubscription(payload.data as SubscriptionData);
  },
  onSubscriptionPlanChanged: async (payload) => {
    await activateSubscription(payload.data as SubscriptionData);
  },
  onSubscriptionCancelled: async (payload) => {
    const data = payload.data as SubscriptionData;
    const userId = await resolveUserId(data);
    if (!userId) return;
    await prisma.user.update({
      where: { id: userId },
      data: {
        proExpiresAt: new Date(data.next_billing_date),
      },
    });
  },
  onSubscriptionExpired: async (payload) => {
    await deactivateSubscription(payload.data as SubscriptionData);
  },
  onSubscriptionFailed: async (payload) => {
    await deactivateSubscription(payload.data as SubscriptionData);
  },
  onSubscriptionOnHold: async (payload) => {
    await deactivateSubscription(payload.data as SubscriptionData);
  },
});
