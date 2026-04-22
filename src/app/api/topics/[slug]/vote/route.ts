import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateElo } from "@/lib/elo";
import { getOrCreateSessionId } from "@/lib/session";

// POST /api/topics/[slug]/vote — submit a vote
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sessionId = await getOrCreateSessionId();
  const { itemAId, itemBId, winnerId } = await req.json();

  if (!itemAId || !itemBId || !winnerId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (winnerId !== itemAId && winnerId !== itemBId) {
    return NextResponse.json({ error: "Invalid winner" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({ where: { slug } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  // Prevent double-voting on the same pair in this session
  const alreadyVoted = await prisma.vote.findFirst({
    where: {
      sessionId,
      topicId: topic.id,
      OR: [
        { itemAId, itemBId },
        { itemAId: itemBId, itemBId: itemAId },
      ],
    },
  });
  if (alreadyVoted) {
    return NextResponse.json(
      { error: "Already voted on this pair" },
      { status: 409 }
    );
  }

  const [itemA, itemB] = await Promise.all([
    prisma.item.findUnique({ where: { id: itemAId } }),
    prisma.item.findUnique({ where: { id: itemBId } }),
  ]);

  if (!itemA || !itemB) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const aWon = winnerId === itemAId;
  const { newEloA, newEloB } = calculateElo(
    itemA.elo,
    itemB.elo,
    itemA.gamesPlayed,
    itemB.gamesPlayed,
    aWon
  );

  await prisma.$transaction([
    prisma.item.update({
      where: { id: itemAId },
      data: { elo: newEloA, gamesPlayed: { increment: 1 } },
    }),
    prisma.item.update({
      where: { id: itemBId },
      data: { elo: newEloB, gamesPlayed: { increment: 1 } },
    }),
    prisma.vote.create({
      data: {
        sessionId,
        topicId: topic.id,
        itemAId,
        itemBId,
        winnerId,
      },
    }),
  ]);

  return NextResponse.json({ success: true, newEloA, newEloB });
}
