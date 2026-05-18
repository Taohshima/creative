import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.item.deleteMany();

  const today = new Date();
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const items = [
    {
      title: "春の新商品キャンペーンLP",
      type: "LP",
      status: "DESIGNING",
      priority: "HIGH",
      description:
        "新商品「Aurora」のローンチに合わせたキャンペーン特設LP。スマホファースト。",
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
      status: "REVIEWING",
      priority: "NORMAL",
      description: "5/20配信のメルマガ用ヘッダーサムネイル",
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
      title: "ブラックフライデーLP（昨年）",
      type: "LP",
      status: "PUBLISHED",
      priority: "NORMAL",
      description: "2025年版BFキャンペーンLP",
      requester: "マーケ部 田中",
      assignee: "デザイナー佐藤",
      dueDate: addDays(-150),
      publishUrl: "https://example.com/bf2025",
      size: "1200x?? / レスポンシブ",
      tags: "BF, 年次",
      tasks: [],
    },
  ];

  for (const it of items) {
    const { tasks, ...rest } = it;
    const created = await prisma.item.create({
      data: {
        ...rest,
        publishedAt: rest.status === "PUBLISHED" ? new Date() : null,
      },
    });
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

  console.log(`Seeded ${items.length} items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
