import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/storage";

function isAdmin(req: Request): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === process.env.ADMIN_SECRET;
}

// DELETE /api/admin/topics/[id] — delete a topic and all its items/votes
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Delete all item images from storage first
  const items = await prisma.item.findMany({
    where: { topicId: id },
    select: { imageUrl: true },
  });

  await Promise.allSettled(
    items
      .filter((i) => i.imageUrl)
      .map((i) => deleteImage(i.imageUrl!))
  );

  await prisma.topic.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
