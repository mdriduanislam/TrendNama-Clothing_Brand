import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIE_NAME, parseAuthSessionValue } from "@/lib/auth-session";
import {
  clearCartForUser,
  readCartForUser,
  removeCartItem,
  upsertCartItem,
} from "@/lib/cart-data";
import { readProductById } from "@/lib/products-data";

const addToCartSchema = z.object({
  action: z.literal("add"),
  item: z.object({
    productId: z.string().min(1),
    selectedSize: z.string().min(1),
    selectedColor: z.string().min(1),
    quantity: z.number().int().positive().default(1),
  }),
});

const removeFromCartSchema = z.object({
  action: z.literal("remove"),
  item: z.object({
    productId: z.string().min(1),
    selectedSize: z.string().min(1),
    selectedColor: z.string().min(1),
  }),
});

const clearCartSchema = z.object({
  action: z.literal("clear"),
});

const getSession = async () => {
  const cookieStore = await cookies();
  return parseAuthSessionValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
};

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await readCartForUser(session.id);
  return NextResponse.json({ cart });
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();

  const addParsed = addToCartSchema.safeParse(payload);
  if (addParsed.success) {
    const product = await readProductById(addParsed.data.item.productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    if (!product.sizes.includes(addParsed.data.item.selectedSize)) {
      return NextResponse.json({ error: "Invalid size." }, { status: 400 });
    }

    if (!product.colors.includes(addParsed.data.item.selectedColor)) {
      return NextResponse.json({ error: "Invalid color." }, { status: 400 });
    }

    await upsertCartItem({
      userId: session.id,
      productId: addParsed.data.item.productId,
      selectedSize: addParsed.data.item.selectedSize,
      selectedColor: addParsed.data.item.selectedColor,
      quantity: addParsed.data.item.quantity,
    });

    const cart = await readCartForUser(session.id);
    return NextResponse.json({ cart });
  }

  const removeParsed = removeFromCartSchema.safeParse(payload);
  if (removeParsed.success) {
    await removeCartItem({
      userId: session.id,
      productId: removeParsed.data.item.productId,
      selectedSize: removeParsed.data.item.selectedSize,
      selectedColor: removeParsed.data.item.selectedColor,
    });

    const cart = await readCartForUser(session.id);
    return NextResponse.json({ cart });
  }

  const clearParsed = clearCartSchema.safeParse(payload);
  if (clearParsed.success) {
    await clearCartForUser(session.id);
    return NextResponse.json({ cart: [] });
  }

  return NextResponse.json({ error: "Invalid cart action payload." }, { status: 400 });
}
