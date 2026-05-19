import { statusLabel, priorityLabel } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`pill pill-${status}`}>{statusLabel(status)}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "NORMAL") return null;
  return (
    <span className={`pill pill-${priority}`}>{priorityLabel(priority)}</span>
  );
}

export function TypeBadge({ type, label }: { type: string; label: string }) {
  return <span className={`tpill tpill-${type}`}>{label}</span>;
}
