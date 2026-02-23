"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  Zap,
  Calendar,
  Award,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { HeatmapData } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GoalInsightsProps {
  data: HeatmapData[];
  streak?: number;
  onDateClick?: (date: string) => void;
  selectedDate?: string | null;
  showInteractiveCalendar?: boolean;
}

export default function GoalInsights({ 
  data,
  streak,
  onDateClick,
  selectedDate,
  showInteractiveCalendar = false,
}: GoalInsightsProps) {
  const insights = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get last 30 days
    const last30Days: {
      date: string;
      duration: number;
      count: number;
      dayName: string;
    }[] = [];
    const dataMap = new Map(data.map((d) => [d.date, d]));

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const entry = dataMap.get(dateStr);
      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

      last30Days.push({
        date: dateStr,
        duration: entry?.duration || 0,
        count: entry?.count || 0,
        dayName: dayNames[date.getDay()],
      });
    }

    // This week vs last week
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisWeekMinutes = 0;
    let lastWeekMinutes = 0;
    let thisWeekDays = 0;
    let lastWeekDays = 0;

    last30Days.forEach((day) => {
      const dayDate = new Date(day.date + "T00:00:00");
      if (dayDate >= thisWeekStart && dayDate <= today) {
        thisWeekMinutes += day.duration;
        if (day.duration > 0) thisWeekDays++;
      } else if (dayDate >= lastWeekStart && dayDate < thisWeekStart) {
        lastWeekMinutes += day.duration;
        if (day.duration > 0) lastWeekDays++;
      }
    });

    const weekChange =
      lastWeekMinutes > 0
        ? ((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100
        : thisWeekMinutes > 0
        ? 100
        : 0;

    // Use streak from backend (accurate for all dates, not limited to 30 days)
    const currentStreak = streak ?? 0;

    // Most productive day of week
    const dayOfWeekStats = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    last30Days.forEach((day) => {
      const dayOfWeek = new Date(day.date + "T00:00:00").getDay();
      dayOfWeekStats[dayOfWeek] += day.duration;
    });
    const maxDay = dayOfWeekStats.indexOf(Math.max(...dayOfWeekStats));
    const dayNames = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];

    // Average daily time
    const activeDays = last30Days.filter((d) => d.duration > 0);
    const avgDailyMinutes =
      activeDays.length > 0
        ? activeDays.reduce((sum, d) => sum + d.duration, 0) / activeDays.length
        : 0;

    // Prepare chart data (last 14 days for better visibility)
    const chartData = last30Days.slice(-14).map((day) => ({
      date: new Date(day.date + "T00:00:00").toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
      }),
      "Thời gian (phút)": day.duration,
      "Số bản ghi": day.count,
    }));

    return {
      last30Days,
      chartData,
      thisWeekMinutes,
      lastWeekMinutes,
      thisWeekDays,
      weekChange,
      currentStreak,
      mostProductiveDay: dayNames[maxDay],
      avgDailyMinutes,
      totalActiveDays: activeDays.length,
    };
  }, [data]);

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-stone-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return "text-green-600";
    if (change < -5) return "text-red-600";
    return "text-stone-500";
  };

  return (
    <div className="space-y-4">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* This Week */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-4 border border-teal-200">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-white rounded-lg">
              <Calendar className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(insights.weekChange)}
              <span
                className={`text-xs font-semibold ${getTrendColor(
                  insights.weekChange
                )}`}
              >
                {insights.weekChange > 0 ? "+" : ""}
                {insights.weekChange.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="text-xl font-bold text-stone-900">
            {formatDuration(insights.thisWeekMinutes)}
          </div>
          <div className="text-xs text-stone-600 mt-1">
            Tuần này • {insights.thisWeekDays} ngày
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200">
          <div className="p-1.5 bg-white rounded-lg w-fit mb-2">
            <Zap className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl font-bold text-stone-900">
            {insights.currentStreak}
          </div>
          <div className="text-xs text-stone-600 mt-1">
            Streak hiện tại
          </div>
        </div>

        {/* Average Daily */}
        <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 rounded-xl p-4 border border-sky-200">
          <div className="p-1.5 bg-white rounded-lg w-fit mb-2">
            <Target className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-stone-900">
            {formatDuration(Math.round(insights.avgDailyMinutes))}
          </div>
          <div className="text-xs text-stone-600 mt-1">
            TB/ngày học
          </div>
        </div>

        {/* Active Days */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
          <div className="p-1.5 bg-white rounded-lg w-fit mb-2">
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-stone-900">
            {insights.totalActiveDays}/30
          </div>
          <div className="text-xs text-stone-600 mt-1">Ngày có học</div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-3">
        {/* Time Trend */}
        <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
          <h4 className="font-medium text-stone-900 mb-3 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-teal-500" />
            Xu hướng 14 ngày
          </h4>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={insights.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#78716c" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e7e5e4",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Line
                type="monotone"
                dataKey="Thời gian (phút)"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ fill: "#14b8a6", r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 p-4">
        <h4 className="font-semibold text-stone-900 mb-2 flex items-center gap-2 text-sm">
          <Award className="w-4 h-4 text-amber-600" />
          Insights
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <p className="text-stone-700">
              Ngày học tốt nhất:{" "}
              <span className="font-semibold text-stone-900">
                {insights.mostProductiveDay}
              </span>
            </p>
          </div>
          {insights.weekChange > 10 && (
            <div className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <p className="text-stone-700">
                Tuần này tăng{" "}
                <span className="font-semibold text-green-600">
                  {insights.weekChange.toFixed(0)}%
                </span>
                . Tuyệt vời!
              </p>
            </div>
          )}
          {insights.weekChange < -10 && (
            <div className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <p className="text-stone-700">
                Tuần này giảm{" "}
                <span className="font-semibold text-red-600">
                  {Math.abs(insights.weekChange).toFixed(0)}%
                </span>
                . Hãy cố gắng hơn!
              </p>
            </div>
          )}
          {insights.currentStreak >= 7 && (
            <div className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <p className="text-stone-700">
                Streak {insights.currentStreak} ngày! Duy trì thói quen tốt này
              </p>
            </div>
          )}
          {insights.currentStreak === 0 && insights.totalActiveDays > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <p className="text-stone-700">
                Hôm nay chưa học? Tạo bản ghi để bắt đầu streak mới!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Mini Calendar - Only show when needed */}
      {showInteractiveCalendar && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-stone-900">
              Lịch học tập 30 ngày
            </h4>
            {selectedDate && (
              <button
                onClick={() => onDateClick?.(selectedDate)}
                className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors"
              >
                Bỏ lọc
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <div className="inline-flex gap-1 min-w-full">
              {insights.last30Days.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center"
                  style={{ minWidth: "28px" }}
                >
                  <div className="text-[10px] text-stone-400 mb-1">
                    {day.dayName}
                  </div>
                  <button
                    onClick={() => onDateClick?.(day.date)}
                    className={`w-7 h-7 rounded transition-all hover:ring-2 hover:ring-teal-400 ${
                      selectedDate === day.date
                        ? "ring-2 ring-teal-600 scale-110"
                        : ""
                    }`}
                    style={{
                      backgroundColor:
                        day.duration === 0
                          ? "#f5f5f4"
                          : day.duration <= 30
                          ? "#ccfbf1"
                          : day.duration <= 60
                          ? "#5eead4"
                          : day.duration <= 120
                          ? "#2dd4bf"
                          : day.duration <= 180
                          ? "#14b8a6"
                          : "#0d9488",
                    }}
                    title={`${day.date}: ${day.count} bản ghi, ${formatDuration(
                      day.duration
                    )}`}
                  >
                    {day.count > 0 && (
                      <span className="text-[10px] font-semibold text-white">
                        {day.count}
                      </span>
                    )}
                  </button>
                  <div className="text-[9px] text-stone-400 mt-0.5">
                    {new Date(day.date + "T00:00:00").getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-stone-500">
            <span>Ít</span>
            {[0, 15, 45, 90, 150, 240].map((d, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor:
                    d === 0
                      ? "#f5f5f4"
                      : d <= 30
                      ? "#ccfbf1"
                      : d <= 60
                      ? "#5eead4"
                      : d <= 120
                      ? "#2dd4bf"
                      : d <= 180
                      ? "#14b8a6"
                      : "#0d9488",
                }}
              />
            ))}
            <span>Nhiều</span>
          </div>
        </div>
      )}
    </div>
  );
}
