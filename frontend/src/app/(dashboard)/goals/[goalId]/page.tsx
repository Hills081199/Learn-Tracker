"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { goalsApi, seriesApi, statsApi } from "@/lib/api";
import type { LearningGoal, LearningSeries, HeatmapData } from "@/types";
import { formatDuration, formatDate } from "@/lib/utils";
import GoalInsights from "@/components/goals/GoalInsights";
import GoalForm from "@/components/goals/GoalForm";
import SeriesCard from "@/components/series/SeriesCard";
import SeriesForm from "@/components/series/SeriesForm";
import { ArrowLeft, Plus, Clock, FileText, Settings, Layers } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.goalId as string;

  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [seriesList, setSeriesList] = useState<LearningSeries[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [editSeries, setEditSeries] = useState<LearningSeries | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [goalData, seriesData, heatmapData] = await Promise.all([
        goalsApi.get(goalId),
        seriesApi.list(goalId),
        statsApi.heatmap(goalId),
      ]);
      setGoal(goalData);
      setSeriesList(seriesData);
      setHeatmap(heatmapData);
    } catch (err) {
      toast.error("Không thể tải dữ liệu");
      router.push("/goals");
    } finally {
      setLoading(false);
    }
  }, [goalId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDeleteSeries(seriesId: string) {
    try {
      await seriesApi.delete(seriesId);
      toast.success("Đã xoá serie");
      loadData();
    } catch (err) {
      toast.error("Lỗi khi xoá serie");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-200 border-t-teal-600"></div>
      </div>
    );
  }

  if (!goal) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Link
            href="/goals"
            className="p-2 rounded-xl hover:bg-stone-100 shrink-0 mt-1 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-400" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-2xl shrink-0">
                {goal.emoji || "📚"}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 truncate">
                  {goal.title}
                </h1>
                {goal.description && (
                  <p className="text-stone-500 text-sm line-clamp-1 mt-0.5">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGoalEdit(true)}
            className="p-2.5 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setEditSeries(null);
              setShowSeriesForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tạo serie</span>
            <span className="sm:hidden">Serie</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 text-center">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500 mx-auto mb-1" />
          <div className="text-lg sm:text-2xl font-bold text-stone-900">
            {goal.series_count || seriesList.length}
          </div>
          <div className="text-xs sm:text-sm text-stone-500">Serie</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 text-center">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 mx-auto mb-1" />
          <div className="text-lg sm:text-2xl font-bold text-stone-900">
            {goal.record_count}
          </div>
          <div className="text-xs sm:text-sm text-stone-500">Bản ghi</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 text-center">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mx-auto mb-1" />
          <div className="text-lg sm:text-2xl font-bold text-stone-900">
            {formatDuration(goal.total_duration || 0)}
          </div>
          <div className="text-xs sm:text-sm text-stone-500">Tổng thời gian</div>
        </div>
      </div>

      {/* Main Content: Insights & Series List */}
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
        {/* Goal Insights */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-900 mb-4">Phân tích & Insights</h3>
          <GoalInsights data={heatmap} />
        </div>

        {/* Series List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-500" />
              Các serie bài học
            </h3>
            <span className="text-sm text-stone-500">
              {seriesList.length} serie
            </span>
          </div>

          {seriesList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
              <p className="text-stone-500">Chưa có serie nào</p>
              <p className="text-stone-400 text-sm mt-1">
                Tạo serie để nhóm các bản ghi học tập lại
              </p>
              <button
                onClick={() => {
                  setEditSeries(null);
                  setShowSeriesForm(true);
                }}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
              >
                Tạo serie đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-2">
              {seriesList.map((s) => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  goalId={goalId}
                  onEdit={() => {
                    setEditSeries(s);
                    setShowSeriesForm(true);
                  }}
                  onDelete={() => handleDeleteSeries(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Series Form Modal */}
      {showSeriesForm && (
        <SeriesForm
          goalId={goalId}
          series={editSeries}
          onClose={() => {
            setShowSeriesForm(false);
            setEditSeries(null);
          }}
          onSaved={() => {
            setShowSeriesForm(false);
            setEditSeries(null);
            loadData();
          }}
        />
      )}

      {/* Goal Edit Modal */}
      {showGoalEdit && (
        <GoalForm
          goal={goal}
          onClose={() => setShowGoalEdit(false)}
          onSaved={() => {
            setShowGoalEdit(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
