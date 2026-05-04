import SwiftUI
import UIKit

/// アプリ本体で選択されたテーマモードをウィジェット側で反映するためのヘルパー。
/// App Group の UserDefaults に書き込まれた値（'system' / 'light' / 'dark'）を読み、
/// アセットカタログの該当バリアントを明示的に取り出して使う。
///
/// `.environment(\.colorScheme, …)` だけだと containerBackground の closure や
/// アセット由来 Color の解決まで貫通しないことがあるため、
/// UIColor の resolvedColor(with:) で直接決め打ちする。
enum WidgetTheme {
    private static let appGroupId = "group.com.uki884.worddiary"
    private static let themeKey = "widgetThemeMode"

    /// 現在のテーマモードを取得する。値が無いか未知の場合は 'system' とみなす。
    static func currentMode() -> String {
        let defaults = UserDefaults(suiteName: appGroupId)
        let value = defaults?.string(forKey: themeKey) ?? "system"
        return (value == "light" || value == "dark") ? value : "system"
    }
}

extension Color {
    /// アセットカタログのカラーセットを、指定されたテーマモードに合わせて解決して返す。
    /// 'system' のときは通常通り現在のトレイトに従い、
    /// 'light' / 'dark' のときは固定のトレイトでバリアントを取り出す。
    static func widgetAsset(_ name: String, mode: String) -> Color {
        guard mode == "light" || mode == "dark" else {
            return Color(name)
        }
        let style: UIUserInterfaceStyle = mode == "dark" ? .dark : .light
        let traits = UITraitCollection(userInterfaceStyle: style)
        guard let resolved = UIColor(named: name)?.resolvedColor(with: traits) else {
            return Color(name)
        }
        return Color(resolved)
    }
}
