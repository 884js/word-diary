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
    var today: String  // "YYYY-MM-DD"
    var todayKind: String  // "weekday" | "saturday" | "sunday" | "holiday"
    let entries: [DiaryEntry]
    /// 今日から HOLIDAY_WINDOW_DAYS 日先までに含まれる祝日 dateKey。
    /// Extension からは holiday-jp ライブラリが使えないので、アプリ側で計算して渡す。
    var upcomingHolidays: [String] = []
    /// アプリ本体で選択されたテーマモード ('system' / 'light' / 'dark')。
    /// JSON ペイロードには含めず、別キーから読み込んだ値を後付けする。
    var themeMode: String = "system"

    private enum CodingKeys: String, CodingKey {
        case totalCount
        case today
        case todayKind
        case entries
        case upcomingHolidays
    }

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
            ],
            upcomingHolidays: []
        )
    }

    static var empty: WidgetData {
        WidgetData(totalCount: 0, today: todayKey(), todayKind: "weekday", entries: [], upcomingHolidays: [])
    }
}

extension WidgetData {
    /// upcomingHolidays は後から足したフィールド。アプリ更新直後など、旧バージョンが
    /// 書いた payload（このキーなし）を読むことがあるため、ここだけ decodeIfPresent で
    /// フォールバックして decode 全体が失敗するのを防ぐ。
    /// init(from:) を extension に置くことでメンバーワイズ init は維持される。
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        totalCount = try container.decode(Int.self, forKey: .totalCount)
        today = try container.decode(String.self, forKey: .today)
        todayKind = try container.decode(String.self, forKey: .todayKind)
        entries = try container.decode([DiaryEntry].self, forKey: .entries)
        upcomingHolidays =
            try container.decodeIfPresent([String].self, forKey: .upcomingHolidays) ?? []
    }
}

private let appGroupId = "group.com.uki884.worddiary"
private let widgetDataKey = "widgetData"

private func todayKey() -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"
    formatter.timeZone = TimeZone.current
    return formatter.string(from: Date())
}

private func dateKey(daysBack: Int) -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"
    formatter.timeZone = TimeZone.current
    let date = Calendar.current.date(byAdding: .day, value: -daysBack, to: Date())!
    return formatter.string(from: date)
}

private func loadWidgetData() -> WidgetData {
    let defaults = UserDefaults(suiteName: appGroupId)
    var data: WidgetData
    if let json = defaults?.string(forKey: widgetDataKey),
       let jsonData = json.data(using: .utf8),
       let decoded = try? JSONDecoder().decode(WidgetData.self, from: jsonData) {
        data = decoded
    } else {
        data = WidgetData.empty
    }
    data.themeMode = WidgetTheme.currentMode()
    return data
}

/// 端末時刻から today キーと曜日種別を計算する。
/// JS 側の値はアプリ未起動の間に古くなるので、レンダリング時に Swift 側で上書きする。
/// 祝日は holidays（アプリ側が事前計算した直近 14 日ぶん）に含まれるか判定する。
private func computeTodayKey(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"
    formatter.timeZone = TimeZone.current
    return formatter.string(from: date)
}

private func computeTodayKind(_ date: Date, holidays: [String]) -> String {
    let key = computeTodayKey(date)
    if holidays.contains(key) { return "holiday" }
    let weekday = Calendar.current.component(.weekday, from: date)
    if weekday == 1 { return "sunday" }
    if weekday == 7 { return "saturday" }
    return "weekday"
}

// MARK: - Timeline Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetEntry {
        WidgetEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (WidgetEntry) -> Void) {
        var data = context.isPreview ? WidgetData.placeholder : loadWidgetData()
        let now = Date()
        data.today = computeTodayKey(now)
        data.todayKind = computeTodayKind(now, holidays: data.upcomingHolidays)
        completion(WidgetEntry(date: now, data: data))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WidgetEntry>) -> Void) {
        let baseData = loadWidgetData()
        let now = Date()
        let calendar = Calendar.current
        let nextMidnight = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)

        // 今のエントリ: today=今日 → 今日のひと言があれば表示される
        var nowData = baseData
        nowData.today = computeTodayKey(now)
        nowData.todayKind = computeTodayKind(now, holidays: baseData.upcomingHolidays)

        // 翌 0:00 のエントリ: today=翌日 → TodayWordWidget は誘導文に切り替わり、
        // RecentWordWidget はヘッダ日付が前進する。
        var nextData = baseData
        nextData.today = computeTodayKey(nextMidnight)
        nextData.todayKind = computeTodayKind(nextMidnight, holidays: baseData.upcomingHolidays)

        let entries = [
            WidgetEntry(date: now, data: nowData),
            WidgetEntry(date: nextMidnight, data: nextData),
        ]
        // 0:00 を過ぎたら getTimeline を再実行して最新の entries を取り直す
        completion(Timeline(entries: entries, policy: .after(nextMidnight)))
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
        let mode = entry.data.themeMode
        switch kind {
        case "saturday": return Color.widgetAsset("weekdaySaturday", mode: mode)
        case "sunday", "holiday": return Color.widgetAsset("weekdaySunday", mode: mode)
        default: return Color.widgetAsset("inkMuted", mode: mode)
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
        let mode = entry.data.themeMode
        VStack(alignment: .leading, spacing: 0) {
            // ヘッダー
            HStack {
                if entry.data.totalCount > 0 {
                    Text("No. \(String(format: "%03d", entry.data.totalCount))")
                        .font(WidgetFont.serif(12))
                        .foregroundColor(Color.widgetAsset("inkMuted", mode: mode))
                }
                Spacer()
                Text(headerDate)
                    .font(WidgetFont.serif(12))
                    .foregroundColor(Color.widgetAsset("inkMuted", mode: mode))
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
                    .foregroundColor(Color.widgetAsset("inkMuted", mode: mode))
                    .frame(maxWidth: .infinity, alignment: .center)
                Spacer()
            } else {
                Rectangle()
                    .fill(Color.widgetAsset("paperRule", mode: mode))
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
                            .foregroundColor(Color.widgetAsset("inkPrimary", mode: mode))
                            .lineLimit(1)
                            .truncationMode(.tail)
                        Spacer(minLength: 0)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    Rectangle()
                        .fill(Color.widgetAsset("paperRule", mode: mode))
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
                    Color.widgetAsset("paperBase", mode: entry.data.themeMode)
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
