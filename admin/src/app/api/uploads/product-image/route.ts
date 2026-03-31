import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const uploadPathAdmin = path.resolve(process.cwd(), "public", "products");
const uploadPathClient = path.resolve(process.cwd(), "..", "client", "public", "products");

const sanitizeExt = (name: string) => {
  const ext = path.extname(name).toLowerCase();

  if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) {
    return ext;
  }

  return ".png";
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file." }, { status: 400 });
  }

  const ext = sanitizeExt(file.name);
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const relativeUrl = `/products/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await mkdir(uploadPathAdmin, { recursive: true });
  await mkdir(uploadPathClient, { recursive: true });

  await Promise.all([
    writeFile(path.join(uploadPathAdmin, fileName), buffer),
    writeFile(path.join(uploadPathClient, fileName), buffer),
  ]);

  return NextResponse.json({ url: relativeUrl });
}
