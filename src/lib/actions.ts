"use server";

import { prisma } from "./db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function s(v: FormDataEntryValue | null): string | undefined {
  if (v === null) return undefined;
  const t = String(v).trim();
  return t === "" ? undefined : t;
}

function dateOrNull(v: FormDataEntryValue | null): Date | null {
  const t = s(v);
  return t ? new Date(t) : null;
}

export async function createItem(formData: FormData) {
  const title = s(formData.get("title"));
  if (!title) throw new Error("title is required");

  const item = await prisma.item.create({
    data: {
      title,
      type: s(formData.get("type")) ?? "OTHER",
      status: s(formData.get("status")) ?? "PLANNING",
      priority: s(formData.get("priority")) ?? "NORMAL",
      description: s(formData.get("description")) ?? null,
      requester: s(formData.get("requester")) ?? null,
      assignee: s(formData.get("assignee")) ?? null,
      dueDate: dateOrNull(formData.get("dueDate")),
      publishUrl: s(formData.get("publishUrl")) ?? null,
      size: s(formData.get("size")) ?? null,
      notes: s(formData.get("notes")) ?? null,
      thumbnailUrl: s(formData.get("thumbnailUrl")) ?? null,
      tags: s(formData.get("tags")) ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath("/list");
  redirect(`/items/${item.id}`);
}

export async function updateItem(id: string, formData: FormData) {
  const title = s(formData.get("title"));
  if (!title) throw new Error("title is required");

  await prisma.item.update({
    where: { id },
    data: {
      title,
      type: s(formData.get("type")) ?? "OTHER",
      status: s(formData.get("status")) ?? "PLANNING",
      priority: s(formData.get("priority")) ?? "NORMAL",
      description: s(formData.get("description")) ?? null,
      requester: s(formData.get("requester")) ?? null,
      assignee: s(formData.get("assignee")) ?? null,
      dueDate: dateOrNull(formData.get("dueDate")),
      publishUrl: s(formData.get("publishUrl")) ?? null,
      size: s(formData.get("size")) ?? null,
      notes: s(formData.get("notes")) ?? null,
      thumbnailUrl: s(formData.get("thumbnailUrl")) ?? null,
      tags: s(formData.get("tags")) ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath("/list");
  revalidatePath(`/items/${id}`);
}

export async function deleteItem(id: string) {
  await prisma.item.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/list");
  redirect("/");
}

export async function setStatus(id: string, status: string) {
  await prisma.item.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/");
  revalidatePath("/list");
  revalidatePath(`/items/${id}`);
}

// REVIEWING / PUBLISHED は廃止。既存レコードを新ステータスに寄せる（冪等）
export async function migrateLegacyStatuses() {
  await prisma.item.updateMany({
    where: { status: "REVIEWING" },
    data: { status: "DESIGNING" },
  });
  await prisma.item.updateMany({
    where: { status: "PUBLISHED" },
    data: { status: "DONE" },
  });
}

export async function addTask(itemId: string, formData: FormData) {
  const title = s(formData.get("title"));
  if (!title) return;
  const last = await prisma.task.findFirst({
    where: { itemId },
    orderBy: { order: "desc" },
  });
  await prisma.task.create({
    data: { itemId, title, order: (last?.order ?? -1) + 1 },
  });
  revalidatePath(`/items/${itemId}`);
}

export async function toggleTask(taskId: string, done: boolean) {
  const t = await prisma.task.update({
    where: { id: taskId },
    data: { done },
  });
  revalidatePath(`/items/${t.itemId}`);
}

export async function deleteTask(taskId: string) {
  const t = await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/items/${t.itemId}`);
}

export async function seedSampleData() {
  const count = await prisma.item.count();
  if (count > 0) {
    revalidatePath("/");
    return;
  }

  const today = new Date();
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const items: Array<{
    title: string;
    type: string;
    status: string;
    priority: string;
    description: string;
    requester: string;
    assignee: string;
    dueDate: Date;
    publishUrl?: string;
    size: string;
    tags: string;
    notes?: string;
    tasks: { title: string; done: boolean }[];
  }> = [
    {
      title: "春の新商品キャンペーンLP",
      type: "LP",
      status: "DESIGNING",
      priority: "HIGH",
      description: "新商品「Aurora」ローンチのキャンペーン特設LP。スマホファースト。",
      requester: "マーケ部 田中",
      assignee: "デザイナー佐藤",
      dueDate: addDays(7),
      publishUrl: "https://example.com/campaign/aurora",
      size: "1200x?? / レスポンシブ",
      tags: "春キャンペーン, 新商品, LP",
      notes: "ファーストビューに動画あり。法務確認必要。",
      tasks: [
        { title: "ワイヤーフレーム作成", done: true },
        { title: "ビジュアルデザイン", done: true },
        { title: "コーディング", done: false },
        { title: "法務確認", done: false },
        { title: "本番公開", done: false },
      ],
    },
    {
      title: "メルマガ用サムネイル（週次）",
      type: "THUMBNAIL",
      status: "DESIGNING",
      priority: "NORMAL",
      description: "週次メルマガ用ヘッダーサムネイル",
      requester: "マーケ部 鈴木",
      assignee: "デザイナー佐藤",
      dueDate: addDays(2),
      size: "1200x630",
      tags: "メルマガ, 定例",
      tasks: [
        { title: "コピー確定", done: true },
        { title: "デザイン", done: true },
        { title: "上長レビュー", done: false },
      ],
    },
    {
      title: "新商品リーフレットA4三つ折り",
      type: "LEAFLET",
      status: "PLANNING",
      priority: "NORMAL",
      description: "店頭配布用リーフレット。両面カラー。初版3000部。",
      requester: "営業企画 高橋",
      assignee: "外注：B印刷",
      dueDate: addDays(21),
      size: "A4三つ折り / 両面カラー",
      tags: "印刷物, 店頭",
      notes: "印刷会社：B印刷／納期2週間",
      tasks: [
        { title: "原稿テキスト準備", done: false },
        { title: "デザイン依頼", done: false },
        { title: "校正", done: false },
        { title: "入稿", done: false },
      ],
    },
    {
      title: "渋谷店舗 駅前看板",
      type: "SIGN",
      status: "DONE",
      priority: "HIGH",
      description: "渋谷店リニューアル告知の駅前大型看板",
      requester: "店舗開発部 佐々木",
      assignee: "外注：C看板工房",
      dueDate: addDays(-3),
      size: "W3000xH2000mm",
      tags: "看板, 店舗",
      notes: "設置場所：JR渋谷駅東口前",
      tasks: [
        { title: "デザイン", done: true },
        { title: "印刷", done: true },
        { title: "設置", done: true },
      ],
    },
    {
      title: "新店舗オープン告知のぼり",
      type: "BANNER",
      status: "REVISING",
      priority: "URGENT",
      description: "横浜新店舗オープン告知用のぼり。20本作成。",
      requester: "店舗開発部 佐々木",
      assignee: "デザイナー佐藤",
      dueDate: addDays(1),
      size: "W600xH1800mm",
      tags: "のぼり, 新店",
      notes: "ロゴが大きすぎとの指摘あり",
      tasks: [
        { title: "初稿", done: true },
        { title: "修正対応", done: false },
        { title: "印刷会社へ入稿", done: false },
      ],
    },
    {
      title: "ブラックフライデーLP",
      type: "LP",
      status: "DONE",
      priority: "NORMAL",
      description: "BFキャンペーンLP",
      requester: "マーケ部 田中",
      assignee: "デザイナー佐藤",
      dueDate: addDays(-150),
      publishUrl: "https://example.com/bf",
      size: "1200x?? / レスポンシブ",
      tags: "BF, 年次",
      tasks: [],
    },
  ];

  for (const it of items) {
    const { tasks, ...rest } = it;
    const created = await prisma.item.create({ data: rest });
    for (let i = 0; i < tasks.length; i++) {
      await prisma.task.create({
        data: {
          itemId: created.id,
          title: tasks[i].title,
          done: tasks[i].done,
          order: i,
        },
      });
    }
  }
  revalidatePath("/");
  revalidatePath("/list");
}

export async function addComment(itemId: string, formData: FormData) {
  const body = s(formData.get("body"));
  if (!body) return;
  await prisma.comment.create({
    data: {
      itemId,
      body,
      author: s(formData.get("author")) ?? null,
    },
  });
  revalidatePath(`/items/${itemId}`);
}
