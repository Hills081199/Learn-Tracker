"use client";

import { useEffect, useState } from "react";
import { statsApi, goalsApi } from "@/lib/api";
import type { StatsOverview, WeeklyData, LearningGoal } from "@/types";
import { formatDuration } from "@/lib/utils";
import {
  Target,
  Clock,
  Flame,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import RecentRecords from "@/components/dashboard/RecentRecords";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [weekly, setWeekly] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, weeklyData] = await Promise.all([
          statsApi.overview(),
          statsApi.weekly(),
        ]);
        setStats(statsData);
        setWeekly(weeklyData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-stone-200 border-t-teal-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-semibold text-stone-800 mb-2">
          Chào mừng đến LearnTracker!
        </h2>
        <p className="text-stone-500 mb-6">
          Bắt đầu bằng cách tạo mục tiêu học tập đầu tiên
        </p>
        <Link
          href="/goals"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo mục tiêu
        </Link>
      </div>
    );
  }

  const statCards = [
    {
      label: "Mục tiêu đang học",
      value: stats.active_goals,
      icon: Target,
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      label: "Tổng bản ghi",
      value: stats.total_records,
      icon: BookOpen,
      iconColor: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      label: "Tổng giờ học",
      value: formatDuration(stats.total_duration),
      icon: Clock,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Streak",
      value: `${stats.streak} ngày`,
      icon: Flame,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 mt-0.5 text-sm">Tổng quan học tập của bạn</p>
        </div>
        <Link
          href="/goals"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tạo mục tiêu</span>
          <span className="sm:hidden">Tạo</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-semibold text-stone-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Goals without today's record */}
      {stats.goals_without_today_record.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-medium text-amber-800">
              Chưa ghi hôm nay
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.goals_without_today_record.map((goal: LearningGoal) => (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-md border border-amber-200 text-sm hover:bg-amber-50 transition-colors text-stone-700"
              >
                <span>{goal.emoji || "📚"}</span>
                <span>{goal.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Chart */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-card">
          <h3 className="text-sm font-medium text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Biểu đồ 7 ngày qua
          </h3>
          <WeeklyChart data={weekly} />
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-card">
          <h3 className="text-sm font-medium text-stone-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Bản ghi gần đây
          </h3>
          <RecentRecords records={stats.recent_records} />
        </div>
      </div>
    </div>
  );
}
