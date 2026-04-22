import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/lib/session";

// GET /api/topics/[slug]/pair — get the next pair to vote on for this session
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sessionId = await getOrCreateSessionId();

  const topic = await prisma.topic.findUnique({ where: { slug } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  // All items in this topic
  const items = await prisma.item.findMany({
    where: { topicId: topic.id },
    orderBy: { elo: "asc" },
  });

  if (items.length < 2) {
    return NextResponse.json(
      { error: "Not enough items to compare", exhausted: true },
      { status: 200 }
    );
  }

  // Pairs this session has already voted on
  const votedPairs = await prisma.vote.findMany({
    where: { sessionId, topicId: topic.id },
    select: { itemAId: true, itemBId: true },
  });

  const votedSet = new Set(
    votedPairs.flatMap(({ itemAId, itemBId }) => [
      `${itemAId}:${itemBId}`,
      `${itemBId}:${itemAId}`,
    ])
  );

  // Build candidate pairs sorted by ELO proximity
  const candidates: [typeof items[0], typeof items[0]][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const key = `${items[i].id}:${items[j].id}`;
      if (!votedSet.has(key)) {
        candidates.push([items[i], items[j]]);
      }
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json({ exhausted: true }, { status: 200 });
  }

  // Sort candidates by ELO proximity (closest first), then pick from top ~20%
  candidates.sort(
    (a, b) =>
      Math.abs(a[0].elo - a[1].elo) - Math.abs(b[0].elo - b[1].elo)
  );

  const poolSize = Math.max(1, Math.ceil(candidates.length * 0.2));
  const pool = candidates.slice(0, poolSize);
  const [itemA, itemB] = pool[Math.floor(Math.random() * pool.length)];

  // Randomly swap order so left/right position isn't biased
  const [left, right] = Math.random() < 0.5 ? [itemA, itemB] : [itemB, itemA];

  return NextResponse.json({ left, right, exhausted: false });
}
