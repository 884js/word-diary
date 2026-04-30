import SwiftUI

/// ウィジェットで使う日本語明朝フォントの名前を一箇所で管理する。
/// 将来アプリの設定画面でフォントをユーザーが選べるようにする場合は、
/// App Group 経由で受け取った値で `body` を分岐させればよい。
enum WidgetFont {
    /// アプリ本体と同じ Noto Serif JP（PostScript 名）。
    /// 別ウェイトを使いたくなったら TTF を Fonts/ に追加して
    /// Info.plist の UIAppFonts に追記してから新しいケースを足す。
    static let body = "NotoSerifJP-Regular"

    static func serif(_ size: CGFloat) -> Font {
        .custom(body, size: size)
    }
}
