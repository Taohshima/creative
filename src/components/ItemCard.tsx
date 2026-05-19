import Link from "next/link";
import { typeLabel } from "@/lib/constants";
import { PriorityBadge, TypeBadge } from "./Badge";
import { IconClock, IconUser } from "./Icons";

type Item = {
  id: string;
  title: string;
  type: string;
  priority: string;
  dueDate: Date | null;
  assignee: string | null;
  requester: string | null;
  thumbnailUrl: string | null;
};

function formatDate(d: Date | null) {
  if (!d) return null;
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function dueClass(d: Date | null) {
  if (!d) return "text-zinc-400";
  const days = (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "text-rose-600 font-semibold";
  if (days < 3) return "text-amber-600 font-semibold";
  return "text-zinc-500";
}

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="card group relative block p-3 pl-[14px] overflow-hidden"
    >
      <span
        className={`absolute left-0 top-2 bottom-2 w-1 rounded-full stripe-${item.type}`}
        aria-hidden
      />

      {item.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnailUrl}
          alt=""
          className="w-full h-24 object-cover rounded-lg mb-2.5 bg-zinc-50"
        />
      ) : (
        <div
          className={`thumb-${item.type} w-full h-24 rounded-lg mb-2.5 flex items-center justify-center text-[11px] font-semibold tracking-wide uppercase`}
        >
          {typeLabel(item.type)}
        </div>
      )}

      <div className="font-medium text-[13.5px] leading-snug mb-2.5 line-clamp-2 text-zinc-900">
        {item.title}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
        <TypeBadge type={item.type} label={typeLabel(item.type)} />
        <PriorityBadge priority={item.priority} />
      </div>

      <div className="flex items-center justify-between text-[11.5px] text-zinc-500 border-t border-zinc-100 pt-2">
        <span className="inline-flex items-center gap-1 truncate max-w-[60%]">
          <IconUser size={12} />
          <span className="truncate">{item.assignee ?? "未割当"}</span>
        </span>
        <span className={`inline-flex items-center gap-1 ${dueClass(item.dueDate)}`}>
          <IconClock size={12} />
          {formatDate(item.dueDate) ?? "—"}
        </span>
      </div>
    </Link>
  );
}
