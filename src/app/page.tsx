import { prisma } from "@/lib/db";
import { KANBAN_COLUMNS, ITEM_TYPES, statusLabel } from "@/lib/constants";
import { ItemCard } from "@/components/ItemCard";
import { seedSampleData, migrateLegacyStatuses } from "@/lib/actions";
import { IconSearch, IconSparkle, IconPlus } from "@/components/Icons";
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

  // 廃止ステータスの既存レコードを移行（冪等・no-op once done）
  await migrateLegacyStatuses();

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
    <div className="space-y-6">
      <PageHeader totalCount={totalCount} />
      {totalCount === 0 && <EmptyState />}
      <Filters typeFilter={typeFilter ?? "ALL"} q={q ?? ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {KANBAN_COLUMNS.map((col) => {
          const list = byStatus.get(col) ?? [];
          return (
            <div key={col} className="col">
              <div className="flex items-center justify-between px-1.5 pb-2.5">
                <span className={`pill pill-${col}`}>{statusLabel(col)}</span>
                <span className="text-[11px] font-medium text-zinc-400 tabular-nums">
                  {list.length}
                </span>
              </div>
              <div className="space-y-2">
                {list.map((it) => (
                  <ItemCard key={it.id} item={it} />
                ))}
                {list.length === 0 && (
                  <div className="text-[11.5px] text-zinc-400 text-center py-6 border border-dashed border-zinc-200 rounded-xl">
                    なし
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

function PageHeader({ totalCount }: { totalCount: number }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900">
          ボード
        </h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          ステータス別に制作物を俯瞰します（全 {totalCount} 件）
        </p>
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
    <div className="relative overflow-hidden rounded-2xl p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50 via-fuchsia-50/40 to-rose-50/30">
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-200/60 to-fuchsia-200/40 blur-2xl" />
      <div className="relative flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-700 font-semibold">
            <IconSparkle size={16} />
            ようこそ Creative管理 へ
          </div>
          <p className="text-[13px] text-zinc-700 mt-1.5 max-w-md">
            制作物がまだ登録されていません。サンプルデータを入れて触ってみるか、新規制作物を作成してください。
          </p>
        </div>
        <div className="flex gap-2">
          <form action={seed}>
            <button className="btn-primary">
              <IconSparkle size={14} />
              サンプルデータを投入
            </button>
          </form>
          <Link href="/items/new" className="btn-secondary inline-flex items-center gap-1.5">
            <IconPlus size={14} />
            新規制作物
          </Link>
        </div>
      </div>
    </div>
  );
}

function Filters({ typeFilter, q }: { typeFilter: string; q: string }) {
  return (
    <form className="flex gap-2 items-center flex-wrap">
      <div className="flex gap-1 items-center bg-white border border-zinc-200 rounded-xl p-1 shadow-sm">
        <Link
          href={`/?${new URLSearchParams({ q }).toString()}`}
          className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition ${
            typeFilter === "ALL"
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          すべて
        </Link>
        {ITEM_TYPES.map((t) => (
          <Link
            key={t.value}
            href={`/?${new URLSearchParams({ type: t.value, q }).toString()}`}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition ${
              typeFilter === t.value
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="flex-1" />

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <IconSearch size={14} />
        </span>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="検索（タイトル / 担当 / タグ）"
          className="input pl-9 w-72"
        />
      </div>
      <input type="hidden" name="type" value={typeFilter} />
      <button className="btn-secondary">絞り込み</button>
    </form>
  );
}
