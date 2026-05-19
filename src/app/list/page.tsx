import { prisma } from "@/lib/db";
import {
  ITEM_TYPES,
  STATUSES,
  typeLabel,
} from "@/lib/constants";
import { StatusBadge, PriorityBadge, TypeBadge } from "@/components/Badge";
import { IconClock, IconCheck, IconSearch } from "@/components/Icons";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const items = await prisma.item.findMany({
    where: {
      type: sp.type && sp.type !== "ALL" ? sp.type : undefined,
      status: sp.status && sp.status !== "ALL" ? sp.status : undefined,
      ...(sp.q
        ? {
            OR: [
              { title: { contains: sp.q } },
              { description: { contains: sp.q } },
              { tags: { contains: sp.q } },
            ],
          }
        : {}),
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { tasks: true, comments: true } },
      tasks: { select: { done: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900">
          一覧
        </h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          納期順に並んだ全制作物（{items.length} 件）
        </p>
      </div>

      <form className="flex gap-2 flex-wrap items-center bg-white border border-zinc-200 rounded-xl p-2.5 shadow-sm">
        <select
          name="type"
          defaultValue={sp.type ?? "ALL"}
          className="input w-auto pr-7"
        >
          <option value="ALL">種別: すべて</option>
          {ITEM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={sp.status ?? "ALL"}
          className="input w-auto pr-7"
        >
          <option value="ALL">ステータス: すべて</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            <IconSearch size={14} />
          </span>
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="検索"
            className="input pl-9"
          />
        </div>
        <button className="btn-primary">絞り込み</button>
      </form>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-[13.5px]">
          <thead className="bg-zinc-50/70 text-zinc-500 text-left text-[11.5px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">タイトル</th>
              <th className="px-4 py-3 font-medium">種別</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">優先度</th>
              <th className="px-4 py-3 font-medium">担当</th>
              <th className="px-4 py-3 font-medium">納期</th>
              <th className="px-4 py-3 font-medium">進捗</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const total = it.tasks.length;
              const done = it.tasks.filter((t) => t.done).length;
              const overdue =
                it.dueDate &&
                new Date(it.dueDate).getTime() < Date.now() &&
                it.status !== "DONE" &&
                it.status !== "ARCHIVED";
              return (
                <tr
                  key={it.id}
                  className="border-t border-zinc-100 hover:bg-zinc-50/60 transition"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/items/${it.id}`}
                      className="text-zinc-900 hover:text-indigo-600 font-medium"
                    >
                      {it.title}
                    </Link>
                    {it.requester && (
                      <div className="text-[11.5px] text-zinc-500 mt-0.5">
                        依頼: {it.requester}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={it.type} label={typeLabel(it.type)} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={it.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={it.priority} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600 text-[12.5px]">
                    {it.assignee ?? <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {it.dueDate ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[12.5px] ${
                          overdue
                            ? "text-rose-600 font-semibold"
                            : "text-zinc-600"
                        }`}
                      >
                        <IconClock size={12} />
                        {new Date(it.dueDate).toLocaleDateString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {total === 0 ? (
                      <span className="text-zinc-300 text-[12.5px]">—</span>
                    ) : (
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${(done / total) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11.5px] text-zinc-500 tabular-nums whitespace-nowrap inline-flex items-center gap-0.5">
                          <IconCheck size={11} />
                          {done}/{total}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-zinc-400 text-[13px]"
                >
                  該当する制作物がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
