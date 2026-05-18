import { prisma } from "@/lib/db";
import {
  ITEM_TYPES,
  STATUSES,
  typeLabel,
  statusLabel,
} from "@/lib/constants";
import { StatusBadge, PriorityBadge } from "@/components/Badge";
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
    include: { _count: { select: { tasks: true } } },
  });

  return (
    <div>
      <form className="mb-4 flex gap-2 flex-wrap items-center bg-white border border-gray-200 rounded-md p-3">
        <select
          name="type"
          defaultValue={sp.type ?? "ALL"}
          className="text-sm border border-gray-300 rounded px-2 py-1"
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
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="ALL">ステータス: すべて</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="🔍 検索"
          className="text-sm border border-gray-300 rounded px-2 py-1 flex-1 min-w-40"
        />
        <button className="text-sm px-3 py-1 bg-gray-900 text-white rounded">
          絞り込み
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">タイトル</th>
              <th className="px-3 py-2 font-medium">種別</th>
              <th className="px-3 py-2 font-medium">ステータス</th>
              <th className="px-3 py-2 font-medium">優先度</th>
              <th className="px-3 py-2 font-medium">担当</th>
              <th className="px-3 py-2 font-medium">納期</th>
              <th className="px-3 py-2 font-medium">タスク</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr
                key={it.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-3 py-2">
                  <Link
                    href={`/items/${it.id}`}
                    className="text-gray-900 hover:underline font-medium"
                  >
                    {it.title}
                  </Link>
                  {it.requester && (
                    <span className="ml-2 text-xs text-gray-500">
                      / 依頼: {it.requester}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-600">{typeLabel(it.type)}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={it.status} />
                </td>
                <td className="px-3 py-2">
                  <PriorityBadge priority={it.priority} />
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {it.assignee ?? "—"}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {it.dueDate
                    ? new Date(it.dueDate).toLocaleDateString("ja-JP")
                    : "—"}
                </td>
                <td className="px-3 py-2 text-gray-600">{it._count.tasks}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-gray-400 text-sm"
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
