import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPanel from "./AdminPanel";

interface Props {
  params: Promise<{ adminSecret: string }>;
}

export default async function AdminPage({ params }: Props) {
  const { adminSecret } = await params;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    notFound();
  }

  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: { orderBy: { elo: "desc" } },
      _count: { select: { votes: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
      <p className="text-gray-400 text-sm mb-8">
        Delete topics or items. Actions are irreversible.
      </p>
      <AdminPanel topics={topics} adminSecret={adminSecret} />
    </div>
  );
}
