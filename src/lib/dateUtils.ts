import holidayJp from '@holiday-jp/holiday_jp';
import { eachDayOfInterval, format, getDay, parseISO } from 'date-fns';

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

export type WeekdayKind = 'weekday' | 'saturday' | 'sunday' | 'holiday';

/**
 * YYYY-MM-DD -> 曜日の種別
 *
 * 祝日は曜日に優先する（土曜が祝日でも 'holiday' を返す）。
 * UI 側では 'holiday' は 'sunday' と同じ赤系で表示することで、
 * 紙の手帳の慣習に揃える。
 */
export function weekdayKind(dateKey: string): WeekdayKind {
  if (isHoliday(dateKey)) return 'holiday';
  const day = getDay(parseISO(dateKey));
  if (day === 0) return 'sunday';
  if (day === 6) return 'saturday';
  return 'weekday';
}

/**
 * その日が日本の祝日か（振替休日・国民の休日も含む）。
 */
export function isHoliday(dateKey: string): boolean {
  return holidayJp.isHoliday(dateKey);
}

/**
 * 祝日名（例: "昭和の日"）。祝日でなければ null。
 */
export function holidayName(dateKey: string): string | null {
  const d = parseISO(dateKey);
  const list = holidayJp.between(d, d);
  return list[0]?.name ?? null;
}

/**
 * YYYY-MM-DD -> 曜日ラベル（日〜土）
 */
export function weekdayLabel(dateKey: string): string {
  const day = getDay(parseISO(dateKey));
  return WEEKDAY_LABELS[day];
}

/**
 * YYYY-MM-DD -> 'M/D(曜)' 形式の短い日付。
 * 一覧行の日付ラベルに使う。
 */
export function shortDate(dateKey: string): string {
  const d = parseISO(dateKey);
  const weekday = WEEKDAY_LABELS[getDay(d)];
  return `${format(d, 'M/d')}(${weekday})`;
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

/**
 * 年またぎ用の結合ラベル: "2024年 12月"
 */
export function yearMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  return `${y}年 ${Number(m)}月`;
}

/**
 * YYYY-MM-DD -> "YYYY年M月D日" 形式の長い日付（年含む）
 */
export function fullDate(dateKey: string): string {
  return format(parseISO(dateKey), 'yyyy年M月d日');
}

/**
 * fromKey から toKey までの全日付キーを昇順で返す（両端含む）。
 */
export function enumerateDates(fromKey: string, toKey: string): string[] {
  if (fromKey > toKey) return [];
  const days = eachDayOfInterval({
    start: parseISO(fromKey),
    end: parseISO(toKey),
  });
  return days.map((d) => toDateKey(d));
}
