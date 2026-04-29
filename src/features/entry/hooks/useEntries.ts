import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  deleteEntry,
  listEntries,
  upsertEntry,
} from '@/lib/database/repository';
import type { Entry } from '@/lib/database/schema';
import { useToday } from '@/lib/hooks/useToday';

const KEYS = {
  all: ['entries'] as const,
};

/**
 * エントリを date 降順の配列へ upsert する。既存があれば差し替え、
 * なければ追加して並べ直す。mutate の onMutate / onSuccess 両方で使う。
 */
function upsertInList(list: Entry[], entry: Entry): Entry[] {
  const idx = list.findIndex((e) => e.date === entry.date);
  if (idx === -1) {
    return [...list, entry].sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  const next = list.slice();
  next[idx] = entry;
  return next;
}

export function useEntries() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => listEntries(),
  });
}

/**
 * 今日のエントリ。useEntries と同じキャッシュから派生させることで、
 * 保存時のキャッシュ二重同期を避ける。
 */
export function useTodayEntry() {
  const today = useToday();
  const select = useCallback(
    (entries: Entry[]) => entries.find((e) => e.date === today) ?? null,
    [today],
  );
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => listEntries(),
    select,
  });
}

type UpsertContext = {
  prevAll: Entry[] | undefined;
};

export function useUpsertEntry() {
  const qc = useQueryClient();
  return useMutation<
    Entry,
    unknown,
    { date: string; word: string },
    UpsertContext
  >({
    mutationFn: ({ date, word }) => upsertEntry(date, word),
    // mutate() 呼び出し中に同期でキャッシュを更新し、DB書き込み待ちのちらつきを消す。
    // `await` を挟むとマイクロタスク境界で React が先に再描画してしまうため、
    // ここは意図的に同期関数にしている（cancelQueries も使わない）。
    onMutate: ({ date, word }) => {
      const prevAll = qc.getQueryData<Entry[]>(KEYS.all);
      const existing = prevAll?.find((e) => e.date === date);
      const now = Date.now();
      const trimmed = word.trim();
      const optimistic: Entry = {
        id: existing?.id ?? `optimistic-${date}`,
        date,
        word: trimmed,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      qc.setQueryData<Entry[] | undefined>(KEYS.all, (cur) =>
        upsertInList(cur ?? [], optimistic),
      );
      return { prevAll };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      qc.setQueryData(KEYS.all, ctx.prevAll);
    },
    // DB側で確定した Entry（本物の id / updatedAt）で楽観値を置き換える。
    // UI上の単語は既に同じ値なのでちらつかない。
    onSuccess: (saved) => {
      qc.setQueryData<Entry[] | undefined>(KEYS.all, (cur) =>
        upsertInList(cur ?? [], saved),
      );
    },
  });
}

type DeleteContext = {
  prevAll: Entry[] | undefined;
};

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation<void, unknown, string, DeleteContext>({
    mutationFn: (date) => deleteEntry(date),
    // mutate 呼び出し中に同期でキャッシュから削除し、DB書き込み待ちの
    // ちらつき（削除前の値が一瞬見える現象）を消す。
    onMutate: (date) => {
      const prevAll = qc.getQueryData<Entry[]>(KEYS.all);
      qc.setQueryData<Entry[] | undefined>(KEYS.all, (prev) =>
        prev ? prev.filter((e) => e.date !== date) : prev,
      );
      return { prevAll };
    },
    onError: (_err, _date, ctx) => {
      if (!ctx) return;
      qc.setQueryData(KEYS.all, ctx.prevAll);
    },
  });
}
