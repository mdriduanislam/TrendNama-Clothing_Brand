import { NextResponse } from "next/server";
import { z } from "zod";

import { readProductById, updateProductById } from "@/lib/products-data";

const updateProductSchema = z.object({
  name: z.string().min(1),
  shortDescription: z.string().min(1).max(120),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  sizes: z.array(z.string()).min(1),
  colors: z.array(z.string()).min(1),
  images: z.record(z.string(), z.string().min(1)),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await readProductById(id);

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await request.json();
  const parsed = updateProductSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product payload." }, { status: 400 });
  }

  const product = await updateProductById(id, parsed.data);

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ product });
}
