import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 原稿用紙の本文マス列。14 マスを均等に並べ、各マスに 1 文字ずつ表示する。
 * 日本語の全角文字は 1 文字 = 1 マスで綺麗に収まる。
 * 文字列が 14 文字未満なら残りは空マス。
 *
 * 編集中は別コンポーネント（InlineEntryEditor）が普通の TextInput で担当し、
 * 確定後の表示だけが 14 マスになる。
 */

/** 入力上限と揃える（MAX_LENGTH）。 */
export const CELL_COUNT = 10;

type Props = {
  /** 表示する単語。undefined なら全マス空。 */
  word?: string;
  /** 文字色（曜日色 or primary）。 */
  textColor: string;
  /** マス同士の縦罫線の色。 */
  ruleColor: string;
};

function SquareCellsInner({ word = '', textColor, ruleColor }: Props) {
  // サロゲートペア対応のため Array.from で分割。
  const chars = Array.from(word);

  return (
    <View style={styles.row}>
      {Array.from({ length: CELL_COUNT }).map((_, i) => {
        const isLast = i === CELL_COUNT - 1;
        const char = chars[i];
        return (
          <View
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            style={[
              styles.cell,
              !isLast && {
                borderRightWidth: StyleSheet.hairlineWidth,
                borderRightColor: ruleColor,
              },
            ]}
          >
            {char ? (
              <Text style={[styles.char, { color: textColor }]}>{char}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export const SquareCells = memo(SquareCellsInner);

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    // flex: 1 だと端数が最後のセルに寄せられて横長に見える場合があるため、
    // % 指定で 10 等分を確定させる。
    width: `${100 / CELL_COUNT}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: {
    fontFamily: 'NotoSerifJP',
    fontSize: 17,
  },
});
