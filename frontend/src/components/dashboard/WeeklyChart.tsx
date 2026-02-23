"use client";

import type { WeeklyData } from "@/types";
import { formatDuration } from "@/lib/utils";

export default function WeeklyChart({ data }: { data: WeeklyData[] }) {
  if (!data.length)
    return <p className="text-stone-400 text-sm">Chưa có dữ liệu</p>;

  const maxDuration = Math.max(...data.map((d) => d.duration), 1);
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="flex items-end gap-3 h-52">
      {data.map((item) => {
        const date = new Date(item.date + "T00:00:00");
        const dayName = days[date.getDay()];
        const height =
          item.duration > 0
            ? Math.max((item.duration / maxDuration) * 100, 8)
            : 4;

        return (
          <div
            key={item.date}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-stone-500">
              {item.duration > 0 ? formatDuration(item.duration) : ""}
            </span>
            <div
              className="w-full flex items-end justify-center"
              style={{ height: "150px" }}
            >
              <div
                className={`w-full max-w-[40px] rounded-t-lg transition-all ${
                  item.duration > 0 ? "bg-teal-500" : "bg-stone-200"
                }`}
                style={{ height: `${height}%` }}
                title={`${formatDuration(item.duration)} - ${item.count} records`}
              />
            </div>
            <span className="text-xs font-medium text-stone-600">
              {dayName}
            </span>
            <span className="text-[10px] text-stone-400">
              {date.getDate()}/{date.getMonth() + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}
