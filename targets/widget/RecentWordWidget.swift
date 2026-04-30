import WidgetKit
import SwiftUI

// MARK: - Data Models

struct DiaryEntry: Codable, Identifiable {
    let date: String  // "YYYY-MM-DD"
    let word: String
    let kind: String  // "weekday" | "saturday" | "sunday" | "holiday"

    var id: String { date }
}

struct WidgetData: Codable {
    let totalCount: Int
    let today: String  // "YYYY-MM-DD"
    let todayKind: String  // "weekday" | "saturday" | "sunday" | "holiday"
    let entries: [DiaryEntry]

    static var placeholder: WidgetData {
        WidgetData(
            totalCount: 43,
            today: todayKey(),
            todayKind: "weekday",
            entries: [
                DiaryEntry(date: todayKey(), word: "さくらが咲いた", kind: "weekday"),
                DiaryEntry(date: dateKey(daysBack: 1), word: "雨の日のコーヒー", kind: "weekday"),
                DiaryEntry(date: dateKey(daysBack: 2), word: "本を読み終えた", kind: "sunday"),
                DiaryEntry(date: dateKey(daysBack: 3), word: "カレー作った", kind: "saturday"),
                DiaryEntry(date: dateKey(daysBack: 4), word: "早起きできた", kind: "weekday"),
                DiaryEntry(date: dateKey(daysBack: 5), word: "新しい靴を履いた", kind: "weekday"),
                DiaryEntry(date: dateKey(daysBack: 6), word: "夕焼けがきれい", kind: "weekday"),
            ]
        )
    }

    static var empty: WidgetData {
        WidgetData(totalCount: 0, today: todayKey(), todayKind: "weekday", entries: [])
    }
}

private let appGroupId = "group.com.uki884.worddiary"
private let widgetDataKey = "widgetData"

private func todayKey() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    formatter.timeZone = TimeZone.current
    return formatter.string(from: Date())
}

private func dateKey(daysBack: Int) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    formatter.timeZone = TimeZone.current
    let date = Calendar.current.date(byAdding: .day, value: -daysBack, to: Date())!
    return formatter.string(from: date)
}

private func loadWidgetData() -> WidgetData {
    let defaults = UserDefaults(suiteName: appGroupId)
    guard let json = defaults?.string(forKey: widgetDataKey),
          let data = json.data(using: .utf8),
          let decoded = try? JSONDecoder().decode(WidgetData.self, from: data)
    else {
        return WidgetData.empty
    }
    return decoded
}

// MARK: - Timeline Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetEntry {
        WidgetEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (WidgetEntry) -> Void) {
        let data = context.isPreview ? WidgetData.placeholder : loadWidgetData()
        completion(WidgetEntry(date: Date(), data: data))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WidgetEntry>) -> Void) {
        let data = loadWidgetData()
        let now = Date()
        let calendar = Calendar.current
        // 翌日 00:00 にリロード(日付が変わったらヘッダーを更新するため)
        let tomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let entry = WidgetEntry(date: now, data: data)
        completion(Timeline(entries: [entry], policy: .after(tomorrow)))
    }
}

struct WidgetEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

// MARK: - View

struct WidgetEntryView: View {
    var entry: WidgetEntry
    @Environment(\.widgetFamily) var family

    private var headerDate: String {
        shortDate(entry.data.today)
    }

    private func shortDate(_ key: String) -> String {
        let parts = key.split(separator: "-")
        guard parts.count == 3,
              let year = Int(parts[0]),
              let month = Int(parts[1]),
              let day = Int(parts[2]) else { return key }
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

    private func weekdayColor(_ kind: String) -> Color {
        switch kind {
        case "saturday": return Color("weekdaySaturday")
        case "sunday", "holiday": return Color("weekdaySunday")
        default: return Color("inkMuted")
        }
    }

    private var displayCount: Int {
        switch family {
        case .systemMedium: return 3
        default: return 7
        }
    }

    private var displayEntries: [DiaryEntry] {
        Array(entry.data.entries.prefix(displayCount))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // ヘッダー
            HStack {
                if entry.data.totalCount > 0 {
                    Text("No. \(String(format: "%03d", entry.data.totalCount))")
                        .font(WidgetFont.serif(12))
                        .foregroundColor(Color("inkMuted"))
                }
                Spacer()
                Text(headerDate)
                    .font(WidgetFont.serif(12))
                    .foregroundColor(Color("inkMuted"))
                    .lineLimit(1)
                    .fixedSize(horizontal: true, vertical: false)
                    .layoutPriority(1)
            }
            .padding(.bottom, 10)

            // リスト
            if displayEntries.isEmpty {
                Spacer()
                Text("最初のひと言を書いてみよう")
                    .font(WidgetFont.serif(14))
                    .foregroundColor(Color("inkMuted"))
                    .frame(maxWidth: .infinity, alignment: .center)
                Spacer()
            } else {
                Rectangle()
                    .fill(Color("paperRule"))
                    .frame(height: 0.5)
                ForEach(displayEntries) { item in
                    HStack(alignment: .center, spacing: 12) {
                        Text(shortDate(item.date))
                            .font(WidgetFont.serif(13))
                            .monospacedDigit()
                            .foregroundColor(weekdayColor(item.kind))
                            .frame(width: 64, alignment: .leading)
                        Text(item.word)
                            .font(WidgetFont.serif(15))
                            .foregroundColor(Color("inkPrimary"))
                            .lineLimit(1)
                            .truncationMode(.tail)
                        Spacer(minLength: 0)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    Rectangle()
                        .fill(Color("paperRule"))
                        .frame(height: 0.5)
                }
            }
        }
    }
}

// MARK: - Widget

struct RecentWordWidget: Widget {
    let kind: String = "RecentWordWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    Color("paperBase")
                }
        }
        .configurationDisplayName("最近のひと言")
        .description("一言日記の最新の記録を表示します。")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - Preview

#Preview(as: .systemLarge) {
    RecentWordWidget()
} timeline: {
    WidgetEntry(date: .now, data: .placeholder)
    WidgetEntry(date: .now, data: .empty)
}

#Preview(as: .systemMedium) {
    RecentWordWidget()
} timeline: {
    WidgetEntry(date: .now, data: .placeholder)
    WidgetEntry(date: .now, data: .empty)
}
