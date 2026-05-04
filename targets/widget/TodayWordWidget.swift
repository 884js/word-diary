import WidgetKit
import SwiftUI

struct TodayWordWidget: Widget {
    let kind: String = "TodayWordWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            TodayWordWidgetView(entry: entry)
                .containerBackground(for: .widget) {
                    Color.widgetAsset("paperBase", mode: entry.data.themeMode)
                }
        }
        .configurationDisplayName("今日のひとこと")
        .description("今日のひと言を表示します。書いていない日はそっと誘ってくれます。")
        .supportedFamilies([.systemSmall])
    }
}

struct TodayWordWidgetView: View {
    var entry: WidgetEntry

    /// 今日書いたひと言。直近のエントリの date が today と一致するなら今日のもの。
    private var todayWord: String? {
        guard let first = entry.data.entries.first,
              first.date == entry.data.today else {
            return nil
        }
        return first.word
    }

    private var dateLabel: String {
        let parts = entry.data.today.split(separator: "-")
        guard parts.count == 3,
              let year = Int(parts[0]),
              let month = Int(parts[1]),
              let day = Int(parts[2]) else { return "" }
        let weekdays = ["日", "月", "火", "水", "木", "金", "土"]
        var components = DateComponents()
        components.year = year
        components.month = month
        components.day = day
        let weekday: String
        if let date = Calendar.current.date(from: components) {
            let idx = Calendar.current.component(.weekday, from: date) - 1
            weekday = weekdays[idx]
        } else {
            weekday = ""
        }
        return "\(month)/\(day)(\(weekday))"
    }

    private var dateColor: Color {
        let mode = entry.data.themeMode
        switch entry.data.todayKind {
        case "saturday": return Color.widgetAsset("weekdaySaturday", mode: mode)
        case "sunday", "holiday": return Color.widgetAsset("weekdaySunday", mode: mode)
        default: return Color.widgetAsset("inkMuted", mode: mode)
        }
    }

    var body: some View {
        let mode = entry.data.themeMode
        VStack(alignment: .leading, spacing: 0) {
            // ヘッダー: 通し番号
            if entry.data.totalCount > 0 {
                Text("No. \(String(format: "%03d", entry.data.totalCount))")
                    .font(WidgetFont.serif(11))
                    .foregroundColor(Color.widgetAsset("inkMuted", mode: mode))
            }

            Spacer(minLength: 0)

            // 中央: 今日のひと言 or 誘導テキスト
            if let word = todayWord {
                Text(word)
                    .font(WidgetFont.serif(18))
                    .foregroundColor(Color.widgetAsset("inkPrimary", mode: mode))
                    .multilineTextAlignment(.leading)
                    .lineLimit(3)
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                Text("今日を、\nひとことで")
                    .font(WidgetFont.serif(14))
                    .foregroundColor(Color.widgetAsset("inkMuted", mode: mode))
                    .multilineTextAlignment(.leading)
                    .lineSpacing(2)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            Spacer(minLength: 0)

            // フッター: 日付
            Text(dateLabel)
                .font(WidgetFont.serif(11))
                .monospacedDigit()
                .foregroundColor(dateColor)
        }
    }
}

#Preview(as: .systemSmall) {
    TodayWordWidget()
} timeline: {
    WidgetEntry(date: .now, data: .placeholder)
    WidgetEntry(date: .now, data: .empty)
}
