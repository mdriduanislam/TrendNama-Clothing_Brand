import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { AUTH_COOKIE_NAME, parseAuthSessionValue } from "@/lib/auth-session";
import { completePaidOrderFromCart } from "@/lib/orders-data";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const finalizeOrderSchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured. Missing STRIPE_SECRET_KEY." },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const session = parseAuthSessionValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = finalizeOrderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid finalize payload." }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const checkoutSession = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);

  if (!checkoutSession || checkoutSession.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed yet." }, { status: 400 });
  }

  const metadataUserId = checkoutSession.metadata?.userId;
  if (!metadataUserId || metadataUserId !== session.id) {
    return NextResponse.json({ error: "Checkout session does not belong to this user." }, { status: 403 });
  }

  const totalAmount = (checkoutSession.amount_total || 0) / 100;
  const currency = (checkoutSession.currency || "usd").toUpperCase();

  const order = await completePaidOrderFromCart({
    userId: session.id,
    stripeSessionId: checkoutSession.id,
    totalAmount,
    currency,
  });

  if (!order) {
    return NextResponse.json(
      { error: "Could not create order. Cart may be empty." },
      { status: 400 }
    );
  }

  return NextResponse.json({ order });
}
