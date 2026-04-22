"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function AddItemPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    if (file) formData.append("image", file);

    const res = await fetch(`/api/topics/${slug}/items`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push(`/topics/${slug}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href={`/topics/${slug}`}
        className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block"
      >
        ← Back to Topic
      </Link>
      <h1 className="text-2xl font-bold mb-6">Add an Item</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name or description of this item"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="image">
            Image (optional)
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-gray-200 file:cursor-pointer hover:file:bg-gray-700"
          />
          {preview && (
            <div className="mt-3 relative w-40 h-40 rounded-lg overflow-hidden border border-gray-700">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? "Adding…" : "Add Item"}
        </button>
      </form>
    </div>
  );
}
