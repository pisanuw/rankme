import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/storage";

function isAdmin(req: Request): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === process.env.ADMIN_SECRET;
}

// DELETE /api/admin/items/[id] — delete an item and its image
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.imageUrl) {
    await deleteImage(item.imageUrl).catch(() => {});
  }

  await prisma.item.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
