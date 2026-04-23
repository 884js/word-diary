import { format, getDay, parseISO } from 'date-fns';

/**
 * ローカル日付をYYYY-MM-DD形式に。
 */
export function toDateKey(d: Date = new Date()): string {
  return format(d, 'yyyy-MM-dd');
}

/**
 * 今日の日付キー。
 */
export function todayKey(): string {
  return toDateKey(new Date());
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

export type WeekdayKind = 'weekday' | 'saturday' | 'sunday';

/**
 * YYYY-MM-DD -> 曜日の種別
 */
export function weekdayKind(dateKey: string): WeekdayKind {
  const day = getDay(parseISO(dateKey));
  if (day === 0) return 'sunday';
  if (day === 6) return 'saturday';
  return 'weekday';
}

/**
 * YYYY-MM-DD -> 曜日ラベル（日〜土）
 */
export function weekdayLabel(dateKey: string): string {
  const day = getDay(parseISO(dateKey));
  return WEEKDAY_LABELS[day];
}

/**
 * YYYY-MM-DD -> 'M/D' 形式の短い日付
 */
export function shortDate(dateKey: string): string {
  return format(parseISO(dateKey), 'M/d');
}

/**
 * YYYY-MM-DD -> 'M月D日 (曜)' 形式のフル日付
 */
export function longDate(dateKey: string): string {
  const d = parseISO(dateKey);
  const weekday = WEEKDAY_LABELS[getDay(d)];
  return `${format(d, 'M月d日')} ${weekday}`;
}

/**
 * YYYY-MM-DD -> 'YYYY年' / 'M月'
 */
export function yearOf(dateKey: string): string {
  return format(parseISO(dateKey), 'yyyy');
}
export function monthOf(dateKey: string): string {
  return format(parseISO(dateKey), 'yyyy-MM');
}
export function monthLabel(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), 'M月');
}
export function yearLabel(yearKey: string): string {
  return `${yearKey}年`;
}
