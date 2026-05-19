import { createItem } from "@/lib/actions";
import { ItemForm } from "@/components/ItemForm";

export default function NewItemPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900">
          新規制作物
        </h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          制作物の基本情報・担当・期日を登録します
        </p>
      </div>
      <ItemForm action={createItem} submitLabel="作成する" />
    </div>
  );
}
