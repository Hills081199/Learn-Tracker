"use client";

import type { LearningSeries } from "@/types";
import { formatDuration, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Clock, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface SeriesCardProps {
  series: LearningSeries;
  goalId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SeriesCard({
  series,
  goalId,
  onEdit,
  onDelete,
}: SeriesCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <Link
        href={`/goals/${goalId}/series/${series.id}`}
        className="group block bg-white rounded-xl border border-stone-200 shadow-card hover:shadow-card-hover transition-shadow p-5"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-stone-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              {series.emoji || "📖"}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-900 truncate group-hover:text-teal-700 transition-colors">
                {series.title}
              </h3>
              {series.description && (
                <p className="text-sm text-stone-500 mt-0.5 line-clamp-1">
                  {series.description}
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
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" /> Xoá
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-stone-500">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {series.record_count} bản ghi
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(series.total_duration || 0)}
          </span>
          {series.last_record_date && (
            <span className="text-xs text-stone-400 ml-auto">
              {formatDate(series.last_record_date)}
            </span>
          )}
        </div>
      </Link>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-stone-900">
              Xác nhận xoá
            </h3>
            <p className="text-stone-500 mt-2">
              Bạn có chắc muốn xoá serie &quot;{series.title}&quot;? Tất cả bản
              ghi trong serie sẽ bị xoá theo.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
