"use client";

import type { HeatmapData } from "@/types";
import { useMemo, useState } from "react";
import { formatDuration } from "@/lib/utils";
import { Flame, TrendingUp, Calendar } from "lucide-react";

interface CalendarHeatmapProps {
  data: HeatmapData[];
  onDateClick?: (date: string) => void;
  selectedDate?: string | null;
}

type ViewPeriod = "3months" | "6months" | "year";

export default function CalendarHeatmap({
  data,
  onDateClick,
  selectedDate,
}: CalendarHeatmapProps) {
  const [period, setPeriod] = useState<ViewPeriod>("6months");
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    duration: number;
    x: number;
    y: number;
  } | null>(null);

  const getDaysCount = (period: ViewPeriod) => {
    switch (period) {
      case "3months":
        return 90;
      case "6months":
        return 180;
      case "year":
        return 365;
    }
  };

  const { weeks, months, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    const daysCount = getDaysCount(period);
    start.setDate(start.getDate() - (daysCount - 1));
    // Align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const dataMap = new Map<string, HeatmapData>();
    data.forEach((d) => dataMap.set(d.date, d));

    const weeks: {
      date: Date;
      count: number;
      duration: number;
      dateStr: string;
    }[][] = [];
    let currentWeek: {
      date: Date;
      count: number;
      duration: number;
      dateStr: string;
    }[] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;

    const current = new Date(start);
    let col = 0;

    // Calculate stats
    let totalDays = 0;
    let totalRecords = 0;
    let totalMinutes = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let bestDay = { date: "", count: 0, duration: 0 };

    // First pass: collect data for stats
    const tempCurrent = new Date(start);
    const allDays: { dateStr: string; count: number; duration: number }[] = [];
    while (tempCurrent <= today) {
      const dateStr = tempCurrent.toISOString().split("T")[0];
      const entry = dataMap.get(dateStr);
      const count = entry?.count || 0;
      const duration = entry?.duration || 0;
      
      allDays.push({ dateStr, count, duration });
      
      if (count > 0) {
        totalDays++;
        totalRecords += count;
        totalMinutes += duration;
        
        if (duration > bestDay.duration) {
          bestDay = { date: dateStr, count, duration };
        }
      }
      
      tempCurrent.setDate(tempCurrent.getDate() + 1);
    }

    // Calculate streaks (from most recent)
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].count > 0) {
        tempStreak++;
        if (i === allDays.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
        if (i === allDays.length - 1) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak;

    // Build weeks for display
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
        duration: entry?.duration || 0,
        dateStr,
      });

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return {
      weeks,
      months,
      stats: {
        totalDays,
        totalRecords,
        totalMinutes,
        currentStreak,
        maxStreak,
        bestDay,
      },
    };
  }, [data, period]);

  function getColor(duration: number): string {
    if (duration === 0) return "#f5f5f4"; // stone-100
    if (duration <= 30) return "#ccfbf1"; // teal-100
    if (duration <= 60) return "#5eead4"; // teal-300
    if (duration <= 120) return "#2dd4bf"; // teal-400
    if (duration <= 180) return "#14b8a6"; // teal-500
    return "#0d9488"; // teal-600
  }

  const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const handleDayHover = (
    day: { dateStr: string; count: number; duration: number },
    event: React.MouseEvent
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredDay({
      date: day.dateStr,
      count: day.count,
      duration: day.duration,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <div className="space-y-4">
      {/* Period Selector & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          {(["3months", "6months", "year"] as ViewPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? "bg-teal-100 text-teal-700"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {p === "3months" ? "3 tháng" : p === "6months" ? "6 tháng" : "1 năm"}
            </button>
          ))}
        </div>

        {/* Mini Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-stone-900">
              {stats.currentStreak}
            </span>
            <span className="text-stone-500">ngày streak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <span className="font-semibold text-stone-900">
              {stats.totalDays}
            </span>
            <span className="text-stone-500">ngày học</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="relative h-5 mb-2 ml-10">
            {months.map((m, i) => (
              <div
                key={i}
                className="absolute text-xs font-medium text-stone-500"
                style={{
                  left: `${m.col * 18}px`,
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1 shrink-0">
              {dayLabels.map((label, i) => (
                <div
                  key={i}
                  className="w-8 h-4 text-[10px] text-stone-400 flex items-center justify-end pr-1 font-medium"
                >
                  {i % 2 === 0 ? label : ""}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.dateStr}
                      onClick={() => onDateClick?.(day.dateStr)}
                      onMouseEnter={(e) => handleDayHover(day, e)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-4 h-4 rounded cursor-pointer transition-all ${
                        day.count > 0 ? "hover:ring-2 hover:ring-teal-400" : ""
                      } ${
                        selectedDate === day.dateStr
                          ? "ring-2 ring-teal-600 scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: getColor(day.duration) }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 ml-10">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400">Ít</span>
              {[0, 15, 45, 90, 150, 240].map((d, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getColor(d) }}
                />
              ))}
              <span className="text-xs text-stone-400 ml-0.5">Nhiều</span>
            </div>
            
            {stats.bestDay.duration > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-stone-500">Best:</span>
                <span className="font-semibold text-stone-900">
                  {formatDuration(stats.bestDay.duration)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-3 py-2 bg-stone-900 text-white rounded-lg text-xs shadow-lg pointer-events-none"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 60}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-semibold mb-1">
            {new Date(hoveredDay.date + "T00:00:00").toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
          {hoveredDay.count > 0 ? (
            <>
              <div>{hoveredDay.count} bản ghi</div>
              <div>{formatDuration(hoveredDay.duration)}</div>
            </>
          ) : (
            <div className="text-stone-400">Không có hoạt động</div>
          )}
          <div
            className="absolute left-1/2 bottom-0 w-2 h-2 bg-stone-900 transform rotate-45 translate-y-1 -translate-x-1/2"
          />
        </div>
      )}
    </div>
  );
}
