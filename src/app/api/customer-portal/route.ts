import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CustomerPortal } from "@dodopayments/nextjs";

const portalHandler = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as
    | "test_mode"
    | "live_mode"
    | undefined,
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { dodoCustomerId: true },
  });
  if (!user?.dodoCustomerId) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  url.searchParams.set("customer_id", user.dodoCustomerId);
  const proxied = new NextRequest(url, request);
  return portalHandler(proxied);
}
