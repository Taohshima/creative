import { createItem } from "@/lib/actions";
import { ItemForm } from "@/components/ItemForm";

export default function NewItemPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">新規制作物</h1>
      <ItemForm action={createItem} submitLabel="作成" />
    </div>
  );
}
