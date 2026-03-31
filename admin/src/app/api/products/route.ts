import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createProduct,
  deleteProductsByIds,
  readProducts,
} from "@/lib/products-data";

const createProductSchema = z.object({
  name: z.string().min(1),
  shortDescription: z.string().min(1).max(120),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  sizes: z.array(z.string()).min(1),
  colors: z.array(z.string()).min(1),
  images: z.record(z.string(), z.string().min(1)),
});

const deleteProductsSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function GET() {
  const products = await readProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createProductSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product payload." }, { status: 400 });
  }

  const newProduct = await createProduct(parsed.data);

  return NextResponse.json({ product: newProduct }, { status: 201 });
}

export async function DELETE(request: Request) {
  const payload = await request.json();
  const parsed = deleteProductsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid delete payload." }, { status: 400 });
  }

  await deleteProductsByIds(parsed.data.ids);

  return NextResponse.json({ deleted: parsed.data.ids.length });
}
