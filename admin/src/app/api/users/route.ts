import { NextResponse } from "next/server";
import { z } from "zod";

import { deleteAdminUsersByIds } from "@/lib/users-data";

const deleteUsersSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function DELETE(request: Request) {
  const payload = await request.json();
  const parsed = deleteUsersSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid delete payload." }, { status: 400 });
  }

  await deleteAdminUsersByIds(parsed.data.ids);

  return NextResponse.json({ deleted: parsed.data.ids.length });
}
