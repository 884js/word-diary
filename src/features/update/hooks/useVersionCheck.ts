import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { todayKey } from '@/lib/dateUtils';

/**
 * バージョン確認の結果。
 * - 「更新が必要」と判定された場合のみ値が入る。
 */
export type VersionUpdate = {
  latestVersion: string;
  storeUrl: string;
};

const COUNTRY = 'jp';
const DISMISSED_DATE_KEY = 'version-check:dismissed-date';

/**
 * "1.0" / "1.0.1" / "1.0.1.0" のような表記揺れを許容するゆるいバージョン比較。
 * - 各セグメントを 10 進整数として比較
 * - 長さが違う場合は短い方を 0 埋め (例: "1.0" は [1,0,0] として扱う)
 * - 数字以外が混ざっている場合は "更新なし" と判断する (誤判定を避ける)
 */
function isOutdated(latest: string, current: string): boolean {
  const parse = (v: string): number[] | null => {
    const parts = v.split('.').map((p) => Number.parseInt(p, 10));
    if (parts.some((n) => Number.isNaN(n))) return null;
    return parts;
  };
  const a = parse(latest);
  const b = parse(current);
  if (!a || !b) return false;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return false;
}

/**
 * iTunes Lookup API を 1 回叩いて、App Store の最新バージョン情報を返す。
 * - 失敗時は null を返す (バナーは出さない)
 */
async function fetchLatestStoreVersion(
  bundleId: string,
): Promise<VersionUpdate | null> {
  try {
    const url = `https://itunes.apple.com/${COUNTRY}/lookup?bundleId=${encodeURIComponent(
      bundleId,
    )}&t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      resultCount?: number;
      results?: Array<{ version?: string; trackId?: number }>;
    };
    const first = json.resultCount ? json.results?.[0] : undefined;
    if (!first?.version || !first.trackId) return null;
    return {
      latestVersion: first.version,
      storeUrl: `itms-apps://apps.apple.com/${COUNTRY}/app/id${first.trackId}`,
    };
  } catch (error) {
    if (__DEV__) console.warn('[version-check] fetch', error);
    return null;
  }
}

/**
 * App Store の最新バージョンを iTunes Lookup API 経由で確認する。
 *
 * - チェックはアプリ起動時に 1 回 (mount 時) 走る。
 * - ユーザーが dismiss した日はその日中は再表示しない (AsyncStorage)。
 * - ネットワーク失敗・形式不正は黙って失敗 (バナーを出さない)。
 * - iOS のみ動作。Android では何もしない (現状本アプリは iOS のみ配布)。
 */
export function useVersionCheck() {
  const [update, setUpdate] = useState<VersionUpdate | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const today = todayKey();

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    let cancelled = false;

    (async () => {
      try {
        const dismissedDate = await AsyncStorage.getItem(DISMISSED_DATE_KEY);
        if (dismissedDate === today) {
          if (!cancelled) setDismissed(true);
          return;
        }

        const bundleId = Constants.expoConfig?.ios?.bundleIdentifier;
        const currentVersion = Application.nativeApplicationVersion;
        if (!bundleId || !currentVersion) return;

        const latest = await fetchLatestStoreVersion(bundleId);
        if (cancelled || !latest) return;

        if (isOutdated(latest.latestVersion, currentVersion)) {
          setUpdate(latest);
        }
      } catch (error) {
        if (__DEV__) console.warn('[version-check] check', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [today]);

  const dismiss = useCallback(async () => {
    try {
      await AsyncStorage.setItem(DISMISSED_DATE_KEY, today);
    } catch (error) {
      if (__DEV__) console.warn('[version-check] dismiss', error);
    }
    setDismissed(true);
  }, [today]);

  return {
    show: update != null && !dismissed,
    update,
    dismiss,
  };
}
