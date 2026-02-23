"use client";

import { useEffect, useState, useCallback } from "react";
import { goalsApi } from "@/lib/api";
import type { LearningGoal } from "@/types";
import GoalCard from "@/components/goals/GoalCard";
import GoalForm from "@/components/goals/GoalForm";
import { Plus, Grid3X3, List } from "lucide-react";
import toast from "react-hot-toast";

export default function GoalsPage() {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<LearningGoal | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadGoals = useCallback(async () => {
    try {
      const data = await goalsApi.list({
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      setGoals(data);
    } catch (err) {
      toast.error("Không thể tải danh sách mục tiêu");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  async function handleDelete(id: string, hard: boolean) {
    try {
      await goalsApi.delete(id, hard);
      toast.success(hard ? "Đã xoá mục tiêu" : "Đã lưu trữ mục tiêu");
      loadGoals();
    } catch (err) {
      toast.error("Lỗi khi xoá mục tiêu");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Mục tiêu học tập
          </h1>
          <p className="text-stone-500 mt-1">{goals.length} mục tiêu</p>
        </div>
        <button
          onClick={() => {
            setEditGoal(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tạo mục tiêu</span>
          <span className="sm:hidden">Tạo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Tìm kiếm mục tiêu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang học</option>
          <option value="PAUSED">Tạm dừng</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>
        <div className="flex border border-stone-200 rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 ${
              viewMode === "grid"
                ? "bg-teal-50 text-teal-600"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 ${
              viewMode === "list"
                ? "bg-teal-50 text-teal-600"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Goal Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-200 border-t-teal-600"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">
            Chưa có mục tiêu nào
          </h3>
          <p className="text-stone-500 mb-4">
            Tạo mục tiêu đầu tiên để bắt đầu hành trình học tập!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm"
          >
            Tạo mục tiêu
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              viewMode={viewMode}
              onEdit={() => {
                setEditGoal(goal);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <GoalForm
          goal={editGoal}
          onClose={() => {
            setShowForm(false);
            setEditGoal(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditGoal(null);
            loadGoals();
          }}
        />
      )}
    </div>
  );
}
