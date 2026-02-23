"use client";

import { useState } from "react";
import type { LearningSeries } from "@/types";
import { seriesApi } from "@/lib/api";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const SERIES_EMOJIS = [
  "📖", "📝", "🎯", "💡", "🧠", "🔬", "📊", "🖥️",
  "🤖", "🧪", "📐", "🎨", "🌐", "🔧", "📱", "🏗️",
];

interface SeriesFormProps {
  goalId: string;
  series?: LearningSeries | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function SeriesForm({
  goalId,
  series,
  onClose,
  onSaved,
}: SeriesFormProps) {
  const [title, setTitle] = useState(series?.title || "");
  const [description, setDescription] = useState(series?.description || "");
  const [emoji, setEmoji] = useState(series?.emoji || "📖");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Tên serie không được để trống");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        emoji,
      };

      if (series) {
        await seriesApi.update(series.id, data);
        toast.success("Đã cập nhật serie");
      } else {
        await seriesApi.create(goalId, data);
        toast.success("Đã tạo serie mới");
      }
      onSaved();
    } catch (err) {
      toast.error("Lỗi khi lưu serie");
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
            {series ? "Chỉnh sửa serie" : "Tạo serie mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
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
              {SERIES_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    emoji === e
                      ? "bg-teal-100 ring-2 ring-teal-500 scale-110"
                      : "bg-stone-50 hover:bg-stone-100 hover:scale-105"
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
              Tên serie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Agentic RAG, Multi-Agent Systems..."
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
              placeholder="Mô tả ngắn về serie bài học..."
              rows={3}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Đang lưu..." : series ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
