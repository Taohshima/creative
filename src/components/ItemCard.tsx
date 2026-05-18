import Link from "next/link";
import { typeLabel } from "@/lib/constants";
import { PriorityBadge, TypeBadge } from "./Badge";

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
  if (!d) return "text-gray-400";
  const days = (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "text-red-600 font-semibold";
  if (days < 3) return "text-orange-600 font-semibold";
  return "text-gray-500";
}

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="block bg-white border border-gray-200 rounded-md p-3 hover:shadow-sm hover:border-gray-300 transition"
    >
      {item.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnailUrl}
          alt=""
          className="w-full h-24 object-cover rounded mb-2 bg-gray-100"
        />
      ) : (
        <div className="w-full h-24 rounded mb-2 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-xs">
          {typeLabel(item.type)}
        </div>
      )}
      <div className="font-medium text-sm leading-tight mb-2 line-clamp-2">
        {item.title}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <TypeBadge type={item.type} label={typeLabel(item.type)} />
        <PriorityBadge priority={item.priority} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 truncate">
          {item.assignee ?? "未割当"}
        </span>
        <span className={dueClass(item.dueDate)}>
          {formatDate(item.dueDate) ?? "—"}
        </span>
      </div>
    </Link>
  );
}
