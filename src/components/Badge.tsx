import { statusLabel, priorityLabel } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`badge-${status} inline-block px-2 py-0.5 rounded text-xs font-medium`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`badge-${priority} inline-block px-2 py-0.5 rounded text-xs font-medium`}
    >
      {priorityLabel(priority)}
    </span>
  );
}

export function TypeBadge({ type, label }: { type: string; label: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
      {label}
    </span>
  );
}
