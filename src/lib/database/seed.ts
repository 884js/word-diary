import { randomUUID } from 'expo-crypto';
import { db } from './client';
import { entries } from './schema';

/**
 * 開発用のサンプルデータ。
 * 見た目確認のために、今月中心＋過去数ヶ月＋年またぎ（昨年末）のデータを入れる。
 * 意図的に未記入日を混ぜて、EmptyEntryRowの見え方も確認できるようにしている。
 */
const SAMPLE: Array<{ date: string; word: string }> = [
  // 2026年4月（今月 / 今日=4/23 は入れない: TodayComposerで書く想定）
  { date: '2026-04-22', word: '夜景' },
  { date: '2026-04-21', word: '映画' },
  { date: '2026-04-20', word: 'カフェ' },
  // 4/19 未記入
  { date: '2026-04-18', word: '読書' },
  { date: '2026-04-17', word: '遠出' },
  { date: '2026-04-16', word: '大掃除' },
  { date: '2026-04-15', word: 'チャーハン' },
  { date: '2026-04-14', word: '買い物' },
  { date: '2026-04-13', word: '散歩' },
  { date: '2026-04-12', word: '風邪' },
  { date: '2026-04-11', word: 'IKEA' },
  { date: '2026-04-10', word: '夜更かし' },
  { date: '2026-04-09', word: '再会' },
  { date: '2026-04-08', word: '雨' },
  { date: '2026-04-07', word: 'ドラマ' },
  // 4/6 未記入
  { date: '2026-04-05', word: '引っ越し' },
  { date: '2026-04-04', word: '荷造り' },
  { date: '2026-04-03', word: '模様替え' },
  // 4/2 未記入
  { date: '2026-04-01', word: '桜' },

  // 2026年3月
  { date: '2026-03-31', word: 'ランチ' },
  { date: '2026-03-30', word: '外食' },
  { date: '2026-03-28', word: '花見' },
  { date: '2026-03-27', word: '桜満開' },
  { date: '2026-03-25', word: '本屋' },
  { date: '2026-03-20', word: '春分の日' },
  { date: '2026-03-14', word: 'ホワイトデー' },
  { date: '2026-03-08', word: 'ラーメン' },
  { date: '2026-03-01', word: '片付け' },

  // 2026年2月
  { date: '2026-02-28', word: '美容院' },
  { date: '2026-02-14', word: 'チョコ' },
  { date: '2026-02-11', word: '建国記念日' },
  { date: '2026-02-03', word: '節分' },

  // 2026年1月
  { date: '2026-01-31', word: 'ジム' },
  { date: '2026-01-26', word: '温泉' },
  { date: '2026-01-15', word: '小正月' },
  { date: '2026-01-08', word: '書き初め' },
  { date: '2026-01-01', word: '元日' },

  // 2025年12月（年またぎ確認用）
  { date: '2025-12-31', word: '大晦日' },
  { date: '2025-12-25', word: 'クリスマス' },
  { date: '2025-12-24', word: 'イブ' },
  { date: '2025-12-15', word: '忘年会' },

  // 2025年11月
  { date: '2025-11-23', word: '勤労感謝' },
];

/**
 * DBが空の場合にサンプルデータを投入する。
 * 非空の場合は何もしない。
 */
export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select().from(entries).limit(1);
  if (existing.length > 0) return;

  const now = Date.now();
  await db.insert(entries).values(
    SAMPLE.map((row) => ({
      id: randomUUID(),
      date: row.date,
      word: row.word,
      createdAt: now,
      updatedAt: now,
    })),
  );
}
