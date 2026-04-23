import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';
import { db } from './client';
import { type Entry, entries } from './schema';

/**
 * 全エントリを日付降順で取得。
 */
export async function listEntries(): Promise<Entry[]> {
  return db.select().from(entries).orderBy(desc(entries.date));
}

/**
 * 指定日のエントリを取得（未記入ならnull）。
 */
export async function getEntryByDate(date: string): Promise<Entry | null> {
  const rows = await db
    .select()
    .from(entries)
    .where(eq(entries.date, date))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * 指定日のエントリを作成または上書き。
 */
export async function upsertEntry(date: string, word: string): Promise<Entry> {
  const now = Date.now();
  const trimmed = word.trim();

  const existing = await getEntryByDate(date);
  if (existing) {
    const [updated] = await db
      .update(entries)
      .set({ word: trimmed, updatedAt: now })
      .where(eq(entries.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(entries)
    .values({
      id: randomUUID(),
      date,
      word: trimmed,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
}

/**
 * 指定日のエントリを削除。
 */
export async function deleteEntry(date: string): Promise<void> {
  await db.delete(entries).where(eq(entries.date, date));
}
