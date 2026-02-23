"use client";

import type { LearningRecord } from "@/types";
import { formatRelativeDate, formatDuration, MOOD_EMOJIS } from "@/lib/utils";

export default function RecentRecords({
  records,
}: {
  records: LearningRecord[];
}) {
  if (!records.length) {
    return <p className="text-stone-400 text-sm">Chưa có bản ghi nào</p>;
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="block p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="font-medium text-sm text-stone-900 truncate">
              {record.title || "Không có tiêu đề"}
            </span>
            <span className="text-xs text-stone-400 shrink-0">
              {formatRelativeDate(record.date)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            {record.duration != null && record.duration > 0 && (
              <span className="shrink-0">⏱️ {formatDuration(record.duration)}</span>
            )}
            {record.mood != null && <span className="shrink-0">{MOOD_EMOJIS[record.mood - 1]}</span>}
            {record.content_raw && (
              <span className="truncate">
                {record.content_raw.substring(0, 80)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
