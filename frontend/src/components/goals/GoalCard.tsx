"use client";

import { useState } from "react";
import type { LearningGoal } from "@/types";
import { formatDuration, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Clock,
  FileText,
  Layers,
  Pencil,
  Trash2,
  Archive,
  MoreVertical,
} from "lucide-react";

interface GoalCardProps {
  goal: LearningGoal;
  viewMode: "grid" | "list";
  onEdit: () => void;
  onDelete: (id: string, hard: boolean) => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAUSED: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-teal-100 text-teal-700",
  ARCHIVED: "bg-stone-100 text-stone-600",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Đang học",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  ARCHIVED: "Lưu trữ",
};

function ProgressBar({
  startDate,
  targetDate,
}: {
  startDate?: string;
  targetDate?: string;
}) {
  if (!startDate || !targetDate) return null;

  const start = new Date(startDate).getTime();
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const progress = Math.min(
    Math.max(((now - start) / (target - start)) * 100, 0),
    100
  );

  return (
    <div className="w-full bg-stone-200 rounded-full h-1.5 mt-3">
      <div
        className="bg-teal-500 h-1.5 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function GoalCard({
  goal,
  viewMode,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <Link
        href={`/goals/${goal.id}`}
        className="group block bg-white rounded-xl border border-stone-200 shadow-card hover:shadow-card-hover transition-shadow p-5"
        style={goal.color ? { borderLeftWidth: "4px", borderLeftColor: goal.color } : {}}
      >
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-stone-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              {goal.emoji || "📚"}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-900 truncate group-hover:text-teal-700 transition-colors">
                {goal.title}
              </h3>
              {goal.description && (
                <p className="text-sm text-stone-500 mt-0.5 line-clamp-1">
                  {goal.description}
                </p>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-stone-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                >
                  <Pencil className="w-4 h-4" /> Chỉnh sửa
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(goal.id, false);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                >
                  <Archive className="w-4 h-4" /> Lưu trữ
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" /> Xoá vĩnh viễn
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3 text-sm text-stone-500">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-500" />
            {goal.series_count || 0} serie
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-500" />
            {goal.record_count} bản ghi
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            {formatDuration(goal.total_duration || 0)}
          </span>
        </div>

        {/* Status + Last updated */}
        <div className="flex items-center justify-between mt-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[goal.status]}`}
          >
            {statusLabels[goal.status]}
          </span>
          {goal.last_record_date && (
            <span className="text-xs text-stone-400">
              {formatDate(goal.last_record_date)}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <ProgressBar
          startDate={goal.start_date}
          targetDate={goal.target_date}
        />

        {/* Tags */}
        {goal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {goal.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-lg text-xs"
                style={{
                  backgroundColor: tag.color ? `${tag.color}15` : "#f1f5f9",
                  color: tag.color || "#64748b",
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-stone-900">
              Xác nhận xoá
            </h3>
            <p className="text-stone-500 mt-2">
              Bạn có chắc muốn xoá vĩnh viễn mục tiêu &quot;{goal.title}
              &quot;? Tất cả serie và bản ghi học tập sẽ bị xoá theo.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50"
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  onDelete(goal.id, true);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Xoá vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
