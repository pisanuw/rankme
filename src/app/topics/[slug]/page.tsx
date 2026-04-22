import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import VotePanel from "./VotePanel";

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      items: { orderBy: { elo: "desc" } },
      _count: { select: { votes: true } },
    },
  });

  if (!topic) notFound();

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 mb-1 inline-block">
            ← All Topics
          </Link>
          <h1 className="text-2xl font-bold">{topic.name}</h1>
          {topic.description && (
            <p className="text-gray-400 mt-1">{topic.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {topic.items.length} items · {topic._count.votes} votes
          </p>
        </div>
        <Link
          href={`/topics/${slug}/add`}
          className="shrink-0 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          + Add Item
        </Link>
      </div>

      {topic.items.length < 2 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">Not enough items to vote yet.</p>
          <p className="text-sm mb-6">Add at least 2 items to start voting.</p>
          <Link
            href={`/topics/${slug}/add`}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg transition-colors"
          >
            Add Items
          </Link>
        </div>
      ) : (
        <VotePanel
          slug={slug}
          leaderboard={topic.items.map((item, i) => ({
            id: item.id,
            title: item.title,
            imageUrl: item.imageUrl,
            elo: item.elo,
            gamesPlayed: item.gamesPlayed,
            rank: i + 1,
          }))}
        />
      )}
    </div>
  );
}
