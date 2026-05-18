import { prisma } from "@/lib/db";
import { KANBAN_COLUMNS, ITEM_TYPES, statusLabel } from "@/lib/constants";
import { ItemCard } from "@/components/ItemCard";
import { seedSampleData } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const typeFilter = sp.type && sp.type !== "ALL" ? sp.type : undefined;
  const q = sp.q?.trim();

  const totalCount = await prisma.item.count();

  const items = await prisma.item.findMany({
    where: {
      type: typeFilter,
      status: { not: "ARCHIVED" },
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { tags: { contains: q } },
              { requester: { contains: q } },
              { assignee: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: [{ priority: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  const byStatus = new Map<string, typeof items>();
  for (const c of KANBAN_COLUMNS) byStatus.set(c, []);
  for (const it of items) {
    const arr = byStatus.get(it.status);
    if (arr) arr.push(it);
  }

  return (
    <div>
      {totalCount === 0 && <EmptyState />}
      <Filters typeFilter={typeFilter ?? "ALL"} q={q ?? ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {KANBAN_COLUMNS.map((col) => {
          const list = byStatus.get(col) ?? [];
          return (
            <div key={col} className="bg-gray-100 rounded-lg p-2 min-h-48">
              <div className="flex items-center justify-between px-1 pb-2">
                <span className={`badge-${col} px-2 py-0.5 rounded text-xs font-semibold`}>
                  {statusLabel(col)}
                </span>
                <span className="text-xs text-gray-500">{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.map((it) => (
                  <ItemCard key={it.id} item={it} />
                ))}
                {list.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">
                    （なし）
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  async function seed() {
    "use server";
    await seedSampleData();
  }
  return (
    <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between flex-wrap gap-3">
      <div>
        <div className="font-semibold text-blue-900">
          ようこそ 🎨 制作物がまだ登録されていません
        </div>
        <div className="text-sm text-blue-800 mt-1">
          右の「サンプルデータを投入」でデモ用の6件を入れるか、ヘッダーの「+ 新規制作物」から始めてください。
        </div>
      </div>
      <div className="flex gap-2">
        <form action={seed}>
          <button className="text-sm px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            サンプルデータを投入
          </button>
        </form>
        <Link
          href="/items/new"
          className="text-sm px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100"
        >
          + 新規制作物
        </Link>
      </div>
    </div>
  );
}

function Filters({ typeFilter, q }: { typeFilter: string; q: string }) {
  return (
    <form className="mb-4 flex gap-2 items-center flex-wrap">
      <Link
        href={`/?${new URLSearchParams({ q }).toString()}`}
        className={`px-3 py-1 rounded text-sm ${
          typeFilter === "ALL"
            ? "bg-gray-900 text-white"
            : "bg-white border border-gray-200 text-gray-700"
        }`}
      >
        すべて
      </Link>
      {ITEM_TYPES.map((t) => (
        <Link
          key={t.value}
          href={`/?${new URLSearchParams({ type: t.value, q }).toString()}`}
          className={`px-3 py-1 rounded text-sm ${
            typeFilter === t.value
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          {t.label}
        </Link>
      ))}
      <div className="flex-1" />
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="🔍 検索（タイトル / 担当 / タグ）"
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white w-64"
      />
      <input type="hidden" name="type" value={typeFilter} />
      <button className="text-sm px-3 py-1.5 border border-gray-300 rounded-md bg-white">
        絞り込み
      </button>
    </form>
  );
}
