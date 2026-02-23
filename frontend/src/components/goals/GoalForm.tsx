"use client";

import { useState } from "react";
import type { LearningGoal, GoalStatus } from "@/types";
import { goalsApi } from "@/lib/api";
import { GOAL_COLORS, GOAL_EMOJIS } from "@/lib/utils";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface GoalFormProps {
  goal?: LearningGoal | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function GoalForm({ goal, onClose, onSaved }: GoalFormProps) {
  const [title, setTitle] = useState(goal?.title || "");
  const [description, setDescription] = useState(goal?.description || "");
  const [emoji, setEmoji] = useState(goal?.emoji || "📚");
  const [color, setColor] = useState(goal?.color || "#3b82f6");
  const [status, setStatus] = useState<GoalStatus>(goal?.status || "ACTIVE");
  const [startDate, setStartDate] = useState(goal?.start_date || "");
  const [targetDate, setTargetDate] = useState(goal?.target_date || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Tên mục tiêu không được để trống");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        emoji,
        color,
        status,
        start_date: startDate || null,
        target_date: targetDate || null,
      };

      if (goal) {
        await goalsApi.update(goal.id, data);
        toast.success("Đã cập nhật mục tiêu");
      } else {
        await goalsApi.create(data);
        toast.success("Đã tạo mục tiêu mới");
      }
      onSaved();
    } catch (err) {
      toast.error("Lỗi khi lưu mục tiêu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900">
            {goal ? "Chỉnh sửa mục tiêu" : "Tạo mục tiêu mới"}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-stone-100">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Emoji Picker */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                    emoji === e
                      ? "bg-teal-100 ring-2 ring-teal-500"
                      : "bg-stone-50 hover:bg-stone-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Tên mục tiêu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Học AI/ML, Tiếng Trung HSK4..."
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về mục tiêu học tập..."
              rows={3}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Màu sắc
            </label>
            <div className="flex gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-teal-500 scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as GoalStatus)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
            >
              <option value="ACTIVE">Đang học</option>
              <option value="PAUSED">Tạm dừng</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Mục tiêu hoàn thành
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Đang lưu..." : goal ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
