"use client";

import { useState } from "react";
import { recordsApi } from "@/lib/api";
import type { LearningRecord } from "@/types";
import { Search, Loader2 } from "lucide-react";
import { formatDate, formatDuration, MOOD_EMOJIS } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await recordsApi.search(query.trim());
      setResults(data);
    } catch (err) {
      toast.error("Lỗi tìm kiếm");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Tìm kiếm</h1>
        <p className="text-stone-500 mt-1">
          Tìm kiếm trong tất cả bản ghi học tập
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ khoá tìm kiếm..."
            className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Tìm"
          )}
        </button>
      </form>

      {searched && (
        <div>
          <p className="text-sm text-stone-500 mb-4">
            Tìm thấy {results.length} kết quả
            {query ? ` cho "${query}"` : ""}
          </p>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-stone-500">
                Không tìm thấy kết quả phù hợp
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((record) => (
                <Link
                  key={record.id}
                  href={
                    record.series_id && record.goal_id
                      ? `/goals/${record.goal_id}/series/${record.series_id}`
                      : `/goals/${record.goal_id}`
                  }
                  className="block bg-white rounded-xl border border-stone-200 p-4 hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-stone-900">
                      {record.title || "Không có tiêu đề"}
                    </h4>
                    <span className="text-sm text-teal-600">
                      {formatDate(record.date)}
                    </span>
                  </div>
                  {record.content_raw && (
                    <p className="text-sm text-stone-500 line-clamp-2">
                      {record.content_raw.substring(0, 200)}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                    {record.duration != null && record.duration > 0 && (
                      <span>⏱️ {formatDuration(record.duration)}</span>
                    )}
                    {record.mood != null && (
                      <span>{MOOD_EMOJIS[record.mood - 1]}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
