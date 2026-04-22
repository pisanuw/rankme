"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface Item {
  id: string;
  title: string;
  imageUrl: string | null;
  elo: number;
  gamesPlayed: number;
  rank: number;
}

interface PairResponse {
  left?: Item;
  right?: Item;
  exhausted: boolean;
  error?: string;
}

interface Props {
  slug: string;
  leaderboard: Item[];
}

type Tab = "vote" | "leaderboard";

export default function VotePanel({ slug, leaderboard: initial }: Props) {
  const [tab, setTab] = useState<Tab>("vote");
  const [pair, setPair] = useState<{ left: Item; right: Item } | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [leaderboard, setLeaderboard] = useState(initial);
  const [lastResult, setLastResult] = useState<{
    winnerId: string;
    newEloA: number;
    newEloB: number;
  } | null>(null);
  const pathname = usePathname();

  const fetchPair = useCallback(async () => {
    setLoading(true);
    setLastResult(null);
    try {
      const res = await fetch(`/api/topics/${slug}/pair`);
      const data: PairResponse = await res.json();
      if (data.exhausted || !data.left || !data.right) {
        setExhausted(true);
        setPair(null);
      } else {
        setExhausted(false);
        setPair({ left: data.left, right: data.right });
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPair();
  }, [fetchPair]);

  async function handleVote(winnerId: string) {
    if (!pair || voting) return;
    setVoting(true);

    const res = await fetch(`/api/topics/${slug}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemAId: pair.left.id,
        itemBId: pair.right.id,
        winnerId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setLastResult({ winnerId, newEloA: data.newEloA, newEloB: data.newEloB });

      // Refresh leaderboard
      const topicRes = await fetch(`/api/topics/${slug}`);
      if (topicRes.ok) {
        const topic = await topicRes.json();
        setLeaderboard(
          topic.items.map((item: Item, i: number) => ({
            ...item,
            rank: i + 1,
          }))
        );
      }

      setTimeout(() => fetchPair(), 1200);
    }

    setVoting(false);
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        {(["vote", "leaderboard"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "vote" && (
        <div>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            </div>
          ) : exhausted ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-2">
                You&apos;ve rated all available pairs!
              </p>
              <p className="text-sm mb-6 text-gray-500">
                Clear your cookies to vote again, or check the leaderboard.
              </p>
              <button
                onClick={() => setTab("leaderboard")}
                className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg text-sm transition-colors"
              >
                See Leaderboard
              </button>
            </div>
          ) : pair ? (
            <div>
              <p className="text-center text-gray-400 text-sm mb-6">
                Click the one you prefer
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[pair.left, pair.right].map((item) => {
                  const isWinner = lastResult?.winnerId === item.id;
                  const isLoser =
                    lastResult && lastResult.winnerId !== item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleVote(item.id)}
                      disabled={voting || !!lastResult}
                      className={`relative flex flex-col items-center bg-gray-900 border rounded-2xl overflow-hidden transition-all duration-300 group
                        ${isWinner ? "border-green-500 scale-[1.02]" : ""}
                        ${isLoser ? "border-red-900 opacity-60" : ""}
                        ${!lastResult ? "border-gray-800 hover:border-indigo-500 hover:scale-[1.01] cursor-pointer" : ""}
                        ${voting ? "cursor-wait" : ""}
                      `}
                    >
                      {item.imageUrl ? (
                        <div className="relative w-full aspect-square">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 400px"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center bg-gray-800 p-6">
                          <span className="text-2xl font-bold text-center leading-snug">
                            {item.title}
                          </span>
                        </div>
                      )}
                      <div className="p-3 w-full">
                        {item.imageUrl && (
                          <p className="font-medium text-sm text-center mb-1">
                            {item.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 text-center">
                          ELO: {Math.round(item.elo)}
                        </p>
                        {isWinner && (
                          <p className="text-xs text-green-400 text-center font-semibold mt-1">
                            Winner!
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {tab === "leaderboard" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Rankings</h2>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500">No items yet.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
                >
                  <span className="text-lg font-bold text-gray-600 w-6 shrink-0 text-right">
                    {item.rank}
                  </span>
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
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.gamesPlayed} matches
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-indigo-400">
                      {Math.round(item.elo)}
                    </p>
                    <p className="text-xs text-gray-500">ELO</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
