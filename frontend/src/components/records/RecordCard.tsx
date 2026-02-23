"use client";

import { useState } from "react";
import type { LearningRecord } from "@/types";
import { formatDate, formatDuration, MOOD_EMOJIS } from "@/lib/utils";
import { Clock, Pencil, Trash2, ChevronRight } from "lucide-react";

interface RecordCardProps {
  record: LearningRecord;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RecordCard({
  record,
  onEdit,
  onDelete,
}: RecordCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Render Tiptap JSON content to HTML
  function renderContent(content: any): string {
    if (!content) return "";
    if (typeof content === "string") return content;

    if (content.type === "doc" && content.content) {
      return content.content.map((node: any) => renderNode(node)).join("");
    }

    return record.content_raw || "";
  }

  function renderNode(node: any): string {
    if (!node) return "";

    const childContent =
      node.content
        ?.map((c: any) => {
          if (c.type === "text") {
            let text = escapeHtml(c.text || "");
            if (c.marks) {
              c.marks.forEach((mark: any) => {
                switch (mark.type) {
                  case "bold":
                    text = `<strong>${text}</strong>`;
                    break;
                  case "italic":
                    text = `<em>${text}</em>`;
                    break;
                  case "underline":
                    text = `<u>${text}</u>`;
                    break;
                  case "strike":
                    text = `<s>${text}</s>`;
                    break;
                  case "code":
                    text = `<code>${text}</code>`;
                    break;
                  case "link":
                    text = `<a href="${mark.attrs?.href || "#"}" target="_blank" rel="noopener">${text}</a>`;
                    break;
                }
              });
            }
            return text;
          }
          return renderNode(c);
        })
        .join("") || "";

    switch (node.type) {
      case "paragraph":
        return `<p>${childContent}</p>`;
      case "heading":
        const lvl = node.attrs?.level || 1;
        return `<h${lvl}>${childContent}</h${lvl}>`;
      case "bulletList":
        return `<ul>${childContent}</ul>`;
      case "orderedList":
        return `<ol>${childContent}</ol>`;
      case "listItem":
        return `<li>${childContent}</li>`;
      case "taskList":
        return `<ul data-type="taskList">${childContent}</ul>`;
      case "taskItem":
        const checked = node.attrs?.checked ? "checked" : "";
        return `<li><input type="checkbox" ${checked} disabled />${childContent}</li>`;
      case "codeBlock":
        return `<pre><code>${childContent}</code></pre>`;
      case "blockquote":
        return `<blockquote>${childContent}</blockquote>`;
      case "horizontalRule":
        return "<hr />";
      case "image":
        const imgWidth = node.attrs?.width ? `width="${node.attrs.width}" style="width:${node.attrs.width}px;max-width:100%;height:auto"` : 'style="max-width:360px;width:100%;height:auto"';
        return `<img src="${node.attrs?.src || ""}" alt="${node.attrs?.alt || ""}" ${imgWidth} class="rounded-lg" />`;
      case "table":
        return `<table>${childContent}</table>`;
      case "tableRow":
        return `<tr>${childContent}</tr>`;
      case "tableCell":
        return `<td>${childContent}</td>`;
      case "tableHeader":
        return `<th>${childContent}</th>`;
      case "hardBreak":
        return "<br />";
      default:
        return childContent;
    }
  }

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const contentHtml = renderContent(record.content);

  return (
    <>
      {/* Collapsed title row */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left"
        >
          <ChevronRight
            className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
              expanded ? "rotate-90" : ""
            }`}
          />
          <span className="text-sm font-medium text-teal-600 shrink-0">
            {formatDate(record.date)}
          </span>
          <span className="font-medium text-stone-900 truncate flex-1">
            {record.title || "Không có tiêu đề"}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {record.mood != null && (
              <span className="text-base" title={`Mood: ${record.mood}/5`}>
                {MOOD_EMOJIS[record.mood - 1]}
              </span>
            )}
            {record.duration != null && record.duration > 0 && (
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(record.duration)}
              </span>
            )}
          </div>
        </button>

        {/* Expanded detail panel */}
        {expanded && (
          <div className="border-t border-stone-100 px-4 py-4">
            {/* Action buttons */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Sửa
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xoá
              </button>
            </div>

            {/* Content */}
            {contentHtml && (
              <div
                className="tiptap prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            )}

            {/* Tags */}
            {record.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-stone-100">
                {record.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 rounded text-xs bg-stone-100 text-stone-600"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Attachments */}
            {record.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100">
                {record.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${att.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-stone-50 rounded text-xs text-teal-600 hover:bg-teal-50"
                  >
                    {att.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-stone-900">
              Xác nhận xoá
            </h3>
            <p className="text-stone-500 mt-2">
              Bạn có chắc muốn xoá bản ghi này?
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
