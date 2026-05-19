import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { ItemForm } from "@/components/ItemForm";
import { updateItem } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return notFound();

  async function action(formData: FormData) {
    "use server";
    await updateItem(id, formData);
    redirect(`/items/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900">
          制作物を編集
        </h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">{item.title}</p>
      </div>
      <ItemForm action={action} defaults={item} submitLabel="保存する" />
    </div>
  );
}
