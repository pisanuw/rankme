import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";

// GET /api/topics — list all topics
export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true, votes: true } } },
  });
  return NextResponse.json(topics);
}

// POST /api/topics — create a topic
export async function POST(req: Request) {
  const { name, description } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const slug = uniqueSlug(name);
  const topic = await prisma.topic.create({
    data: { name: name.trim(), description: description?.trim() ?? null, slug },
  });
  return NextResponse.json(topic, { status: 201 });
}
