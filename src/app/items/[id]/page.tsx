import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  typeLabel,
  STATUSES,
  statusLabel,
} from "@/lib/constants";
import {
  setStatus,
  addTask,
  toggleTask,
  deleteTask,
  addComment,
  deleteItem,
} from "@/lib/actions";
import { StatusBadge, PriorityBadge, TypeBadge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { order: "asc" } },
      comments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!item) return notFound();

  const doneCount = item.tasks.filter((t) => t.done).length;
  const totalTasks = item.tasks.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* メイン */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <TypeBadge type={item.type} label={typeLabel(item.type)} />
                <StatusBadge status={item.status} />
                <PriorityBadge priority={item.priority} />
              </div>
              <h1 className="text-2xl font-bold">{item.title}</h1>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/items/${item.id}/edit`}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                編集
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deleteItem(item.id);
                }}
              >
                <button className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50">
                  削除
                </button>
              </form>
            </div>
          </div>

          {item.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnailUrl}
              alt=""
              className="w-full max-h-80 object-contain rounded-md bg-gray-50 mb-4"
            />
          )}

          {item.description && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 font-medium mb-1">説明</div>
              <p className="text-sm whitespace-pre-wrap">{item.description}</p>
            </div>
          )}

          {item.notes && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 font-medium mb-1">メモ</div>
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {item.notes}
              </p>
            </div>
          )}

          {item.tags && (
            <div className="flex gap-1.5 flex-wrap">
              {item.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* タスク */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">タスク</h2>
            <span className="text-xs text-gray-500">
              {doneCount} / {totalTasks}
            </span>
          </div>
          <ul className="space-y-1.5 mb-4">
            {item.tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 group hover:bg-gray-50 rounded px-1 py-0.5"
              >
                <form
                  action={async () => {
                    "use server";
                    await toggleTask(t.id, !t.done);
                  }}
                >
                  <button
                    className={`w-4 h-4 rounded border ${
                      t.done
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300"
                    } flex items-center justify-center text-xs`}
                    title={t.done ? "未完了に戻す" : "完了にする"}
                  >
                    {t.done ? "✓" : ""}
                  </button>
                </form>
                <span
                  className={`text-sm flex-1 ${
                    t.done ? "line-through text-gray-400" : ""
                  }`}
                >
                  {t.title}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await deleteTask(t.id);
                  }}
                >
                  <button
                    className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    title="削除"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
            {item.tasks.length === 0 && (
              <li className="text-sm text-gray-400">タスクがありません</li>
            )}
          </ul>
          <form
            action={async (fd) => {
              "use server";
              await addTask(item.id, fd);
            }}
            className="flex gap-2"
          >
            <input
              name="title"
              placeholder="新しいタスク（例：初稿提出, 法務確認）"
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button className="text-sm px-3 py-1 bg-gray-900 text-white rounded">
              追加
            </button>
          </form>
        </div>

        {/* コメント */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <h2 className="font-semibold mb-3">フィードバック / コメント</h2>
          <form
            action={async (fd) => {
              "use server";
              await addComment(item.id, fd);
            }}
            className="space-y-2 mb-4"
          >
            <input
              name="author"
              placeholder="あなたの名前（任意）"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <textarea
              name="body"
              required
              placeholder="修正依頼や確認事項を書く..."
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <div className="flex justify-end">
              <button className="text-sm px-3 py-1 bg-gray-900 text-white rounded">
                投稿
              </button>
            </div>
          </form>
          <ul className="space-y-3">
            {item.comments.map((c) => (
              <li key={c.id} className="border-l-2 border-gray-200 pl-3">
                <div className="text-xs text-gray-500 mb-0.5">
                  <span className="font-medium text-gray-700">
                    {c.author ?? "匿名"}
                  </span>
                  {" · "}
                  {new Date(c.createdAt).toLocaleString("ja-JP")}
                </div>
                <div className="text-sm whitespace-pre-wrap">{c.body}</div>
              </li>
            ))}
            {item.comments.length === 0 && (
              <li className="text-sm text-gray-400">コメントはまだありません</li>
            )}
          </ul>
        </div>
      </div>

      {/* サイドバー */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-3">
            ステータス変更
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUSES.map((s) => (
              <form
                key={s.value}
                action={async () => {
                  "use server";
                  await setStatus(item.id, s.value);
                }}
              >
                <button
                  className={`w-full text-xs px-2 py-1.5 rounded badge-${
                    s.value
                  } ${
                    item.status === s.value
                      ? "ring-2 ring-offset-1 ring-gray-400"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {s.label}
                </button>
              </form>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-4 space-y-2 text-sm">
          <KV k="依頼者" v={item.requester} />
          <KV k="制作担当" v={item.assignee} />
          <KV
            k="納期"
            v={
              item.dueDate
                ? new Date(item.dueDate).toLocaleDateString("ja-JP")
                : null
            }
          />
          <KV k="サイズ / 仕様" v={item.size} />
          <KV
            k="公開先"
            v={
              item.publishUrl ? (
                <a
                  href={item.publishUrl}
                  target="_blank"
                  className="text-blue-600 hover:underline break-all"
                >
                  {item.publishUrl}
                </a>
              ) : null
            }
          />
          <KV
            k="公開日"
            v={
              item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString("ja-JP")
                : null
            }
          />
          <KV
            k="作成日"
            v={new Date(item.createdAt).toLocaleDateString("ja-JP")}
          />
        </div>
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <div className="w-20 text-gray-500 text-xs flex-shrink-0 pt-0.5">{k}</div>
      <div className="flex-1 text-sm">{v || <span className="text-gray-400">—</span>}</div>
    </div>
  );
}
