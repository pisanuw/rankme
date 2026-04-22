"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Item {
  id: string;
  title: string;
  imageUrl: string | null;
  elo: number;
  gamesPlayed: number;
}

interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { votes: number };
  items: Item[];
}

interface Props {
  topics: Topic[];
  adminSecret: string;
}

export default function AdminPanel({ topics: initial, adminSecret }: Props) {
  const router = useRouter();
  const [topics, setTopics] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteTopic(id: string) {
    if (!confirm("Delete this topic and ALL its items? This cannot be undone."))
      return;
    setDeleting(id);
    const res = await fetch(`/api/admin/topics/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": adminSecret },
    });
    if (res.ok) {
      setTopics((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } else {
      alert("Failed to delete topic");
    }
    setDeleting(null);
  }

  async function deleteItem(topicId: string, itemId: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setDeleting(itemId);
    const res = await fetch(`/api/admin/items/${itemId}`, {
      method: "DELETE",
      headers: { "x-admin-secret": adminSecret },
    });
    if (res.ok) {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? { ...t, items: t.items.filter((i) => i.id !== itemId) }
            : t
        )
      );
    } else {
      alert("Failed to delete item");
    }
    setDeleting(null);
  }

  if (topics.length === 0) {
    return <p className="text-gray-500">No topics exist yet.</p>;
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
        >
          {/* Topic header */}
          <div className="flex items-center gap-3 px-5 py-4">
            <button
              onClick={() =>
                setExpanded(expanded === topic.id ? null : topic.id)
              }
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {expanded === topic.id ? "▾" : "▸"}
                </span>
                <div>
                  <p className="font-semibold">{topic.name}</p>
                  <p className="text-xs text-gray-500">
                    {topic.items.length} items · {topic._count.votes} votes
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => deleteTopic(topic.id)}
              disabled={deleting === topic.id}
              className="text-sm text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting === topic.id ? "Deleting…" : "Delete Topic"}
            </button>
          </div>

          {/* Items list */}
          {expanded === topic.id && (
            <div className="border-t border-gray-800">
              {topic.items.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-500">No items.</p>
              ) : (
                <div className="divide-y divide-gray-800">
                  {topic.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-5 py-3"
                    >
                      {item.imageUrl && (
                        <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          ELO: {Math.round(item.elo)} · {item.gamesPlayed}{" "}
                          matches
                        </p>
                      </div>
                      <button
                        onClick={() => deleteItem(topic.id, item.id)}
                        disabled={deleting === item.id}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                      >
                        {deleting === item.id ? "…" : "Delete"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
