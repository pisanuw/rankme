import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";

// POST /api/topics/[slug]/items — add an item (text or image upload)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const topic = await prisma.topic.findUnique({ where: { slug } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  let title = "";
  let imageUrl: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    title = (formData.get("title") as string | null)?.trim() ?? "";
    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      imageUrl = await uploadImage(file, topic.id);
    }
  } else {
    const body = await req.json();
    title = body.title?.trim() ?? "";
  }

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: { topicId: topic.id, title, imageUrl },
  });

  return NextResponse.json(item, { status: 201 });
}
