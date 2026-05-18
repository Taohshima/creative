import { ITEM_TYPES, STATUSES, PRIORITIES } from "@/lib/constants";

type Defaults = {
  title?: string;
  type?: string;
  status?: string;
  priority?: string;
  description?: string | null;
  requester?: string | null;
  assignee?: string | null;
  dueDate?: Date | null;
  publishUrl?: string | null;
  size?: string | null;
  notes?: string | null;
  thumbnailUrl?: string | null;
  tags?: string | null;
};

function toDateInput(d?: Date | null) {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function ItemForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: Defaults;
  submitLabel: string;
}) {
  const d = defaults ?? {};
  return (
    <form action={action} className="space-y-5 bg-white border border-gray-200 rounded-md p-6">
      <Field label="タイトル" required>
        <input
          name="title"
          required
          defaultValue={d.title ?? ""}
          className={inputCls}
          placeholder="例：春キャンペーン LP"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="種別">
          <select name="type" defaultValue={d.type ?? "LP"} className={inputCls}>
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ステータス">
          <select
            name="status"
            defaultValue={d.status ?? "PLANNING"}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="優先度">
          <select
            name="priority"
            defaultValue={d.priority ?? "NORMAL"}
            className={inputCls}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="依頼者（部署 / 個人）">
          <input
            name="requester"
            defaultValue={d.requester ?? ""}
            className={inputCls}
            placeholder="例：マーケ部 田中"
          />
        </Field>
        <Field label="制作担当">
          <input
            name="assignee"
            defaultValue={d.assignee ?? ""}
            className={inputCls}
            placeholder="例：デザイナー佐藤 / 外注A社"
          />
        </Field>
        <Field label="納期">
          <input
            type="date"
            name="dueDate"
            defaultValue={toDateInput(d.dueDate)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="説明 / 要件">
        <textarea
          name="description"
          defaultValue={d.description ?? ""}
          rows={3}
          className={inputCls}
          placeholder="目的・訴求ポイント・参考情報など"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="サイズ / 仕様">
          <input
            name="size"
            defaultValue={d.size ?? ""}
            className={inputCls}
            placeholder="例：1200x630 / A4 / W600xH1800mm"
          />
        </Field>
        <Field label="公開先URL">
          <input
            type="url"
            name="publishUrl"
            defaultValue={d.publishUrl ?? ""}
            className={inputCls}
            placeholder="https://..."
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="サムネイル画像URL">
          <input
            type="url"
            name="thumbnailUrl"
            defaultValue={d.thumbnailUrl ?? ""}
            className={inputCls}
            placeholder="https://..."
          />
        </Field>
        <Field label="タグ（カンマ区切り）">
          <input
            name="tags"
            defaultValue={d.tags ?? ""}
            className={inputCls}
            placeholder="例：春キャンペーン, 新商品"
          />
        </Field>
      </div>

      <Field label="メモ">
        <textarea
          name="notes"
          defaultValue={d.notes ?? ""}
          rows={2}
          className={inputCls}
          placeholder="印刷会社・部数・配布先など補足"
        />
      </Field>

      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </div>
      {children}
    </label>
  );
}
