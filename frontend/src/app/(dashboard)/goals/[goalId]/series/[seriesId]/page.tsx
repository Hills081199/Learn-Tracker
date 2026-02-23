"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { seriesApi, recordsApi, statsApi, goalsApi } from "@/lib/api";
import type {
  LearningSeries,
  LearningGoal,
  LearningRecord,
  HeatmapData,
} from "@/types";
import { formatDuration, formatDate } from "@/lib/utils";
import RecordCard from "@/components/records/RecordCard";
import CalendarHeatmap from "@/components/records/CalendarHeatmap";
import SeriesForm from "@/components/series/SeriesForm";
import { ArrowLeft, Plus, Clock, FileText, Settings } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const RecordEditor = dynamic(
  () => import("@/components/records/RecordEditor"),
  { ssr: false }
);

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.goalId as string;
  const seriesId = params.seriesId as string;

  const [series, setSeries] = useState<LearningSeries | null>(null);
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editRecord, setEditRecord] = useState<LearningRecord | null>(null);
  const [showSeriesEdit, setShowSeriesEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [seriesData, goalData, recordsData, heatmapData] =
        await Promise.all([
          seriesApi.get(seriesId),
          goalsApi.get(goalId),
          recordsApi.listBySeries(seriesId),
          statsApi.heatmap(undefined, seriesId),
        ]);
      setSeries(seriesData);
      setGoal(goalData);
      setRecords(recordsData);
      setHeatmap(heatmapData);
    } catch (err) {
      toast.error("Không thể tải dữ liệu");
      router.push(`/goals/${goalId}`);
    } finally {
      setLoading(false);
    }
  }, [goalId, seriesId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDeleteRecord(recordId: string) {
    try {
      await recordsApi.delete(recordId);
      toast.success("Đã xoá bản ghi");
      loadData();
    } catch (err) {
      toast.error("Lỗi khi xoá bản ghi");
    }
  }

  function handleDateClick(date: string) {
    setSelectedDate(selectedDate === date ? null : date);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-200 border-t-teal-600"></div>
      </div>
    );
  }

  if (!series) return null;

  const filteredRecords = selectedDate
    ? records.filter((r) => r.date === selectedDate)
    : records;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Link
            href={`/goals/${goalId}`}
            className="p-2 rounded-xl hover:bg-stone-100 shrink-0 mt-1 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-400" />
          </Link>
          <div className="min-w-0 flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-stone-400 mb-1">
              <Link
                href={`/goals/${goalId}`}
                className="hover:text-teal-600 transition-colors flex items-center gap-1"
              >
                <span>{goal?.emoji || "📚"}</span>
                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                  {goal?.title}
                </span>
              </Link>
              <span>/</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-xl shrink-0">
                {series.emoji || "📖"}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 truncate">
                  {series.title}
                </h1>
                {series.description && (
                  <p className="text-stone-500 text-sm line-clamp-1">
                    {series.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSeriesEdit(true)}
            className="p-2.5 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setEditRecord(null);
              setShowEditor(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Ghi hôm nay</span>
            <span className="sm:hidden">Ghi</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 text-center">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500 mx-auto mb-1" />
          <div className="text-lg sm:text-2xl font-bold text-stone-900">
            {series.record_count}
          </div>
          <div className="text-xs sm:text-sm text-stone-500">Bản ghi</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 text-center">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mx-auto mb-1" />
          <div className="text-lg sm:text-2xl font-bold text-stone-900">
            {formatDuration(series.total_duration || 0)}
          </div>
          <div className="text-xs sm:text-sm text-stone-500">Tổng thời gian</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl mb-1">📅</div>
          <div className="text-sm sm:text-lg font-bold text-stone-900 truncate px-1">
            {series.last_record_date
              ? formatDate(series.last_record_date)
              : "N/A"}
          </div>
          <div className="text-xs sm:text-sm text-stone-500">Lần cuối</div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-semibold text-stone-900 mb-4">Lịch học tập</h3>
        <CalendarHeatmap
          data={heatmap}
          onDateClick={handleDateClick}
          selectedDate={selectedDate}
        />
      </div>

      {/* Record Timeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">
            Bản ghi học tập
            {selectedDate && (
              <span className="text-sm font-normal text-teal-600 ml-2">
                (Ngày {formatDate(selectedDate)})
                <button
                  onClick={() => setSelectedDate(null)}
                  className="ml-1 text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </span>
            )}
          </h3>
          <span className="text-sm text-stone-500">
            {filteredRecords.length} bản ghi
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-stone-500">Chưa có bản ghi nào</p>
            <button
              onClick={() => {
                setEditRecord(null);
                setShowEditor(true);
              }}
              className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              Tạo bản ghi đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onEdit={() => {
                  setEditRecord(record);
                  setShowEditor(true);
                }}
                onDelete={() => handleDeleteRecord(record.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <RecordEditor
          seriesId={seriesId}
          record={editRecord}
          onClose={() => {
            setShowEditor(false);
            setEditRecord(null);
          }}
          onSaved={() => {
            setShowEditor(false);
            setEditRecord(null);
            loadData();
          }}
        />
      )}

      {/* Series Edit Modal */}
      {showSeriesEdit && (
        <SeriesForm
          goalId={goalId}
          series={series}
          onClose={() => setShowSeriesEdit(false)}
          onSaved={() => {
            setShowSeriesEdit(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
