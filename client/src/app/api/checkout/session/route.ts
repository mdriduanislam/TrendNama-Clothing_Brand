import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { AUTH_COOKIE_NAME, parseAuthSessionValue } from "@/lib/auth-session";
import { readCartForUser } from "@/lib/cart-data";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured. Missing STRIPE_SECRET_KEY." },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const session = parseAuthSessionValue(
    cookieStore.get(AUTH_COOKIE_NAME)?.value
  );

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await readCartForUser(session.id);

  if (!cart.length) {
    return NextResponse.json(
      { error: "Your cart is empty." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const origin = new URL(request.url).origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: cart.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          description: `Size: ${item.selectedSize.toUpperCase()} | Color: ${item.selectedColor}`,
          images: [new URL(item.images[item.selectedColor], origin).toString()],
        },
      },
    })),
    success_url: `${origin}/cart?step=3&status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart?step=3&status=cancelled`,
    metadata: {
      userId: session.id,
      source: "client-checkout",
    },
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Could not create checkout session." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: checkoutSession.url });
}
