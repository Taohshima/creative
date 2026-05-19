import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { typeLabel, STATUSES } from "@/lib/constants";
import {
  setStatus,
  addTask,
  toggleTask,
  deleteTask,
  addLink,
  deleteLink,
  deleteItem,
} from "@/lib/actions";
import { StatusBadge, PriorityBadge, TypeBadge } from "@/components/Badge";
import {
  IconCheck,
  IconClock,
  IconUser,
  IconExternal,
  IconEdit,
  IconTrash,
  IconPlus,
} from "@/components/Icons";

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
      links: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!item) return notFound();

  const doneCount = item.tasks.filter((t) => t.done).length;
  const totalTasks = item.tasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneCount / totalTasks) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* メイン */}
      <div className="lg:col-span-2 space-y-5">
        {/* ヒーロー */}
        <div className="card overflow-hidden">
          {/* type gradient header */}
          <div className={`thumb-${item.type} h-2`} />

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                  <TypeBadge type={item.type} label={typeLabel(item.type)} />
                  <StatusBadge status={item.status} />
                  <PriorityBadge priority={item.priority} />
                </div>
                <h1 className="text-[24px] font-semibold tracking-tight text-zinc-900 leading-tight">
                  {item.title}
                </h1>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/items/${item.id}/edit`}
                  className="btn-secondary inline-flex items-center gap-1.5"
                >
                  <IconEdit size={13} />
                  編集
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteItem(item.id);
                  }}
                >
                  <button className="btn-secondary inline-flex items-center gap-1.5 hover:!bg-rose-50 hover:!border-rose-200 hover:!text-rose-600">
                    <IconTrash size={13} />
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
                className="w-full max-h-96 object-contain rounded-lg bg-zinc-50 mb-5 border border-zinc-100"
              />
            )}

            {item.description && (
              <div className="mb-5">
                <SectionLabel>説明</SectionLabel>
                <p className="text-[14px] text-zinc-700 whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {item.notes && (
              <div className="mb-5">
                <SectionLabel>メモ</SectionLabel>
                <p className="text-[13.5px] text-zinc-600 whitespace-pre-wrap leading-relaxed bg-zinc-50/60 rounded-lg p-3 border border-zinc-100">
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
                      className="text-[11.5px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* タスク */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[15px] text-zinc-900">タスク</h2>
            <div className="flex items-center gap-2.5">
              {totalTasks > 0 && (
                <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <span className="text-[11.5px] text-zinc-500 tabular-nums">
                {doneCount} / {totalTasks}
              </span>
            </div>
          </div>
          <ul className="space-y-0.5 mb-4">
            {item.tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2.5 group hover:bg-zinc-50 rounded-lg px-1.5 py-1.5 transition"
              >
                <form
                  action={async () => {
                    "use server";
                    await toggleTask(t.id, !t.done);
                  }}
                >
                  <button
                    className={`checkbox ${t.done ? "checked" : ""}`}
                    title={t.done ? "未完了に戻す" : "完了にする"}
                  >
                    {t.done && <IconCheck size={11} />}
                  </button>
                </form>
                <span
                  className={`text-[13.5px] flex-1 ${
                    t.done ? "line-through text-zinc-400" : "text-zinc-800"
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
                    className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-1"
                    title="削除"
                  >
                    <IconTrash size={13} />
                  </button>
                </form>
              </li>
            ))}
            {item.tasks.length === 0 && (
              <li className="text-[13px] text-zinc-400 px-1.5 py-2">
                タスクがありません
              </li>
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
              placeholder="新しいタスク（例：初稿提出、法務確認）"
              className="input flex-1"
            />
            <button className="btn-primary">
              <IconPlus size={13} />
              追加
            </button>
          </form>
        </div>

        {/* リンク */}
        <div className="card p-6">
          <h2 className="font-semibold text-[15px] text-zinc-900 mb-3 inline-flex items-center gap-2">
            <IconExternal size={14} />
            関連リンク
          </h2>
          <ul className="space-y-1.5 mb-4">
            {item.links.map((l) => {
              const host = safeHost(l.url);
              const favicon = host
                ? `https://www.google.com/s2/favicons?domain=${host}&sz=32`
                : null;
              return (
                <li
                  key={l.id}
                  className="flex items-center gap-3 group hover:bg-zinc-50 rounded-lg px-2 py-2 transition border border-transparent hover:border-zinc-100"
                >
                  <div className="w-7 h-7 rounded-md bg-zinc-100 grid place-items-center flex-shrink-0 overflow-hidden">
                    {favicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={favicon}
                        alt=""
                        className="w-4 h-4"
                      />
                    ) : (
                      <IconExternal size={13} className="text-zinc-400" />
                    )}
                  </div>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0"
                  >
                    <div className="text-[13.5px] font-medium text-zinc-900 hover:text-indigo-600 truncate">
                      {l.title || host || l.url}
                    </div>
                    <div className="text-[11.5px] text-zinc-500 truncate">
                      {l.url}
                    </div>
                  </a>
                  <form
                    action={async () => {
                      "use server";
                      await deleteLink(l.id);
                    }}
                  >
                    <button
                      className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-1"
                      title="削除"
                    >
                      <IconTrash size={13} />
                    </button>
                  </form>
                </li>
              );
            })}
            {item.links.length === 0 && (
              <li className="text-[13px] text-zinc-400 px-2 py-2">
                リンクがまだ追加されていません
              </li>
            )}
          </ul>
          <form
            action={async (fd) => {
              "use server";
              await addLink(item.id, fd);
            }}
            className="space-y-2 pt-3 border-t border-zinc-100"
          >
            <input
              name="url"
              type="url"
              required
              placeholder="https://www.figma.com/file/... または https://drive.google.com/..."
              className="input"
            />
            <div className="flex gap-2">
              <input
                name="title"
                placeholder="表示名（任意・空ならドメイン名）"
                className="input flex-1"
              />
              <button className="btn-primary">
                <IconPlus size={13} />
                追加
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* サイドバー */}
      <aside className="space-y-4">
        <div className="card p-4">
          <SectionLabel>ステータスを変更</SectionLabel>
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
                  className={`w-full pill pill-${s.value} justify-center transition ${
                    item.status === s.value
                      ? "ring-2 ring-offset-1 ring-zinc-300 !font-semibold"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ width: "100%" }}
                >
                  {s.label}
                </button>
              </form>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3.5">
          <KV
            icon={<IconUser size={13} />}
            k="依頼者"
            v={item.requester}
          />
          <KV
            icon={<IconUser size={13} />}
            k="制作担当"
            v={item.assignee}
          />
          <KV
            icon={<IconClock size={13} />}
            k="納期"
            v={
              item.dueDate
                ? new Date(item.dueDate).toLocaleDateString("ja-JP")
                : null
            }
          />
          <KV k="サイズ / 仕様" v={item.size} />
          <KV
            icon={item.publishUrl ? <IconExternal size={13} /> : undefined}
            k="公開先"
            v={
              item.publishUrl ? (
                <a
                  href={item.publishUrl}
                  target="_blank"
                  className="text-indigo-600 hover:underline break-all"
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
      </aside>
    </div>
  );
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
      {children}
    </div>
  );
}

function KV({
  icon,
  k,
  v,
}: {
  icon?: React.ReactNode;
  k: string;
  v: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-20 flex-shrink-0 text-[11.5px] text-zinc-500 pt-0.5 inline-flex items-center gap-1">
        {icon}
        {k}
      </div>
      <div className="flex-1 text-[13px] text-zinc-800 min-w-0 break-words">
        {v || <span className="text-zinc-300">—</span>}
      </div>
    </div>
  );
}
