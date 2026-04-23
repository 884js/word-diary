import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * 単語日記のエントリ
 * 1日1行が基本（dateがUNIQUE）。編集は上書き。
 */
export const entries = sqliteTable('entries', {
  id: text('id').primaryKey(),
  date: text('date').notNull().unique(), // 'YYYY-MM-DD'（ローカル日付）
  word: text('word').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
