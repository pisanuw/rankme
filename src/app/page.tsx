import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function HomePage() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true, votes: true } } },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Topics</h1>
        <p className="text-gray-400">
          Pick a topic and vote for your favorite — or create a new one.
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-4">No topics yet.</p>
          <Link
            href="/topics/new"
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg transition-colors"
          >
            Create the first topic
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-indigo-500 transition-colors group"
            >
              <h2 className="text-lg font-semibold mb-1 group-hover:text-indigo-400 transition-colors">
                {topic.name}
              </h2>
              {topic.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {topic.description}
                </p>
              )}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{topic._count.items} items</span>
                <span>{topic._count.votes} votes</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
