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
    <form action={action} className="space-y-6 card p-7">
      <Section title="基本情報">
        <Field label="タイトル" required>
          <input
            name="title"
            required
            defaultValue={d.title ?? ""}
            className="input"
            placeholder="例：春キャンペーン LP"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="種別">
            <select name="type" defaultValue={d.type ?? "LP"} className="input">
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
              className="input"
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
              className="input"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="担当・期日">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="依頼者（部署 / 個人）">
            <input
              name="requester"
              defaultValue={d.requester ?? ""}
              className="input"
              placeholder="例：マーケ部 田中"
            />
          </Field>
          <Field label="制作担当">
            <input
              name="assignee"
              defaultValue={d.assignee ?? ""}
              className="input"
              placeholder="例：佐藤 / 外注A社"
            />
          </Field>
          <Field label="納期">
            <input
              type="date"
              name="dueDate"
              defaultValue={toDateInput(d.dueDate)}
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title="内容">
        <Field label="説明 / 要件">
          <textarea
            name="description"
            defaultValue={d.description ?? ""}
            rows={3}
            className="input resize-y"
            placeholder="目的・訴求ポイント・参考情報など"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="サイズ / 仕様">
            <input
              name="size"
              defaultValue={d.size ?? ""}
              className="input"
              placeholder="例：1200x630 / A4 / W600xH1800mm"
            />
          </Field>
          <Field label="公開先URL">
            <input
              type="url"
              name="publishUrl"
              defaultValue={d.publishUrl ?? ""}
              className="input"
              placeholder="https://..."
            />
          </Field>
        </div>
      </Section>

      <Section title="付加情報">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="サムネイル画像URL">
            <input
              type="url"
              name="thumbnailUrl"
              defaultValue={d.thumbnailUrl ?? ""}
              className="input"
              placeholder="https://..."
            />
          </Field>
          <Field label="タグ（カンマ区切り）">
            <input
              name="tags"
              defaultValue={d.tags ?? ""}
              className="input"
              placeholder="例：春キャンペーン, 新商品"
            />
          </Field>
        </div>

        <Field label="メモ">
          <textarea
            name="notes"
            defaultValue={d.notes ?? ""}
            rows={2}
            className="input resize-y"
            placeholder="印刷会社・部数・配布先など補足"
          />
        </Field>
      </Section>

      <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

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
      <div className="text-[12px] font-medium text-zinc-600 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </div>
      {children}
    </label>
  );
}
