import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteEntry,
  getEntryByDate,
  listEntries,
  upsertEntry,
} from '@/lib/database/repository';
import { todayKey } from '@/lib/dateUtils';

const KEYS = {
  all: ['entries'] as const,
  today: () => ['entries', 'today', todayKey()] as const,
  byDate: (date: string) => ['entries', 'date', date] as const,
};

export function useEntries() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => listEntries(),
  });
}

export function useTodayEntry() {
  return useQuery({
    queryKey: KEYS.today(),
    queryFn: () => getEntryByDate(todayKey()),
  });
}

export function useUpsertEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, word }: { date: string; word: string }) =>
      upsertEntry(date, word),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.today() });
    },
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => deleteEntry(date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.today() });
    },
  });
}
