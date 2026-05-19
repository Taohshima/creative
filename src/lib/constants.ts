export const ITEM_TYPES = [
  { value: "LP", label: "LP" },
  { value: "THUMBNAIL", label: "サムネイル" },
  { value: "LEAFLET", label: "リーフレット" },
  { value: "SIGN", label: "看板" },
  { value: "BANNER", label: "のぼり" },
  { value: "OTHER", label: "その他" },
] as const;

export const STATUSES = [
  { value: "PLANNING", label: "企画" },
  { value: "DESIGNING", label: "制作中" },
  { value: "REVISING", label: "修正中" },
  { value: "DONE", label: "完成" },
  { value: "ARCHIVED", label: "アーカイブ" },
] as const;

export const PRIORITIES = [
  { value: "URGENT", label: "緊急" },
  { value: "HIGH", label: "高" },
  { value: "NORMAL", label: "中" },
  { value: "LOW", label: "低" },
] as const;

export const KANBAN_COLUMNS = [
  "PLANNING",
  "DESIGNING",
  "REVISING",
  "DONE",
] as const;

export function statusLabel(v: string) {
  return STATUSES.find((s) => s.value === v)?.label ?? v;
}
export function typeLabel(v: string) {
  return ITEM_TYPES.find((t) => t.value === v)?.label ?? v;
}
export function priorityLabel(v: string) {
  return PRIORITIES.find((p) => p.value === v)?.label ?? v;
}
