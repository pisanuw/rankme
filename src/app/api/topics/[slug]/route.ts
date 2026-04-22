import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/topics/[slug] — get topic with items sorted by ELO
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      items: { orderBy: { elo: "desc" } },
      _count: { select: { votes: true } },
    },
  });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }
  return NextResponse.json(topic);
}
