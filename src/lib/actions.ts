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
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    },
  });
  revalidatePath("/");
  revalidatePath("/list");
  revalidatePath(`/items/${id}`);
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
