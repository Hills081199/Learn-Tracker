"use client";

import type { HeatmapData } from "@/types";
import { useMemo } from "react";

interface CalendarHeatmapProps {
  data: HeatmapData[];
  onDateClick?: (date: string) => void;
  selectedDate?: string | null;
}

export default function CalendarHeatmap({
  data,
  onDateClick,
  selectedDate,
}: CalendarHeatmapProps) {
  const { weeks, months } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    // Align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const dataMap = new Map<string, HeatmapData>();
    data.forEach((d) => dataMap.set(d.date, d));

    const weeks: { date: Date; count: number; dateStr: string }[][] = [];
    let currentWeek: { date: Date; count: number; dateStr: string }[] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;

    const current = new Date(start);
    let col = 0;

    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0];
      const entry = dataMap.get(dateStr);

      if (current.getDay() === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];

        if (current.getMonth() !== lastMonth) {
          const monthNames = [
            "Th1",
            "Th2",
            "Th3",
            "Th4",
            "Th5",
            "Th6",
            "Th7",
            "Th8",
            "Th9",
            "Th10",
            "Th11",
            "Th12",
          ];
          months.push({ label: monthNames[current.getMonth()], col });
          lastMonth = current.getMonth();
        }
        col++;
      }

      currentWeek.push({
        date: new Date(current),
        count: entry?.count || 0,
        dateStr,
      });

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, months };
  }, [data]);

  function getColor(count: number): string {
    if (count === 0) return "#ebedf0";
    if (count === 1) return "#9be9a8";
    if (count <= 3) return "#40c463";
    if (count <= 5) return "#30a14e";
    return "#216e39";
  }

  const dayLabels = ["", "T2", "", "T4", "", "T6", ""];

  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="relative h-4 mb-2 ml-8">
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute text-xs text-stone-400 whitespace-nowrap"
              style={{
                left: `${m.col * 14}px`,
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1 shrink-0">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="w-6 h-[12px] text-[10px] text-stone-400 flex items-center justify-end pr-1"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day) => (
                  <div
                    key={day.dateStr}
                    onClick={() => onDateClick?.(day.dateStr)}
                    className={`w-[12px] h-[12px] rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-stone-400 ${
                      selectedDate === day.dateStr
                        ? "ring-2 ring-teal-500"
                        : ""
                    }`}
                    style={{ backgroundColor: getColor(day.count) }}
                    title={`${day.dateStr}: ${day.count} bản ghi`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 ml-8 mt-3">
          <span className="text-xs text-stone-400 mr-1">Ít</span>
          {[0, 1, 2, 4, 6].map((c) => (
            <div
              key={c}
              className="w-[12px] h-[12px] rounded-sm"
              style={{ backgroundColor: getColor(c) }}
            />
          ))}
          <span className="text-xs text-stone-400 ml-1">Nhiều</span>
        </div>
      </div>
    </div>
  );
}
