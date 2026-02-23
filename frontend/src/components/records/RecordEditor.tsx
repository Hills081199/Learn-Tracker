"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import ResizableImageExtension from "./ResizableImageExtension";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { common, createLowlight } from "lowlight";
import type { LearningRecord } from "@/types";
import { recordsApi, uploadApi } from "@/lib/api";
import { MOOD_EMOJIS } from "@/lib/utils";
import {
  X,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Quote,
  Minus,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import toast from "react-hot-toast";

const lowlight = createLowlight(common);

interface RecordEditorProps {
  seriesId: string;
  record?: LearningRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function RecordEditor({
  seriesId,
  record,
  onClose,
  onSaved,
}: RecordEditorProps) {
  const [title, setTitle] = useState(record?.title || "");
  const [date, setDate] = useState(
    record?.date || new Date().toISOString().split("T")[0]
  );
  const [duration, setDuration] = useState(record?.duration || 0);
  const [mood, setMood] = useState(record?.mood || 3);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      ResizableImageExtension.configure({ allowBase64: true }),
      TiptapLink.configure({ openOnClick: false }),
      Underline,
      Placeholder.configure({
        placeholder: "Hôm nay bạn đã học được gì?",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: record?.content || "",
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  // Image upload
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await uploadApi.upload(file);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const url = `${apiUrl}${result.url}`;
        editor?.chain().focus().setImage({ src: url }).run();
        toast.success("Đã upload ảnh");
      } catch (err) {
        toast.error("Lỗi upload ảnh");
      }
    };
    input.click();
  }, [editor]);

  // Add link
  const addLink = useCallback(() => {
    const url = prompt("Nhập URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  // Save
  async function handleSave() {
    if (!editor) return;

    setSaving(true);
    try {
      const content = editor.getJSON();
      const contentRaw = editor.getText();

      const data = {
        title: title.trim() || null,
        content,
        content_raw: contentRaw,
        date,
        duration: duration || null,
        mood,
      };

      if (record) {
        await recordsApi.update(record.id, data);
        toast.success("Đã cập nhật bản ghi");
      } else {
        await recordsApi.create(seriesId, data);
        toast.success("Đã lưu bản ghi");
      }
      onSaved();
    } catch (err) {
      toast.error("Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  }

  if (!editor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900">
            {record ? "Chỉnh sửa bản ghi" : "Ghi chép học tập"}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-stone-100">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row min-h-0">
          {/* Editor Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-stone-100 bg-stone-50 overflow-x-auto">
              <ToolButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                active={editor.isActive("heading", { level: 1 })}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                active={editor.isActive("heading", { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                active={editor.isActive("heading", { level: 3 })}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </ToolButton>

              <div className="w-px h-6 bg-stone-300 mx-1" />

              <ToolButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive("underline")}
                title="Underline"
              >
                <UnderlineIcon className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive("strike")}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </ToolButton>

              <div className="w-px h-6 bg-stone-300 mx-1" />

              <ToolButton
                onClick={() =>
                  editor.chain().focus().toggleBulletList().run()
                }
                active={editor.isActive("bulletList")}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() =>
                  editor.chain().focus().toggleOrderedList().run()
                }
                active={editor.isActive("orderedList")}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() =>
                  editor.chain().focus().toggleTaskList().run()
                }
                active={editor.isActive("taskList")}
                title="Checklist"
              >
                <CheckSquare className="w-4 h-4" />
              </ToolButton>

              <div className="w-px h-6 bg-stone-300 mx-1" />

              <ToolButton
                onClick={() =>
                  editor.chain().focus().toggleCodeBlock().run()
                }
                active={editor.isActive("codeBlock")}
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() =>
                  editor.chain().focus().toggleBlockquote().run()
                }
                active={editor.isActive("blockquote")}
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() =>
                  editor.chain().focus().setHorizontalRule().run()
                }
                title="Divider"
              >
                <Minus className="w-4 h-4" />
              </ToolButton>

              <div className="w-px h-6 bg-stone-300 mx-1" />

              <ToolButton onClick={handleImageUpload} title="Upload Image">
                <ImageIcon className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={addLink}
                active={editor.isActive("link")}
                title="Link"
              >
                <LinkIcon className="w-4 h-4" />
              </ToolButton>
              <ToolButton
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
                title="Table"
              >
                <TableIcon className="w-4 h-4" />
              </ToolButton>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Sidebar Metadata */}
          <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-stone-100 p-4 space-y-4 bg-stone-50 lg:shrink-0">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Tiêu đề (tuỳ chọn)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề bản ghi..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Ngày
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Thời lượng: {duration} phút
              </label>
              <input
                type="range"
                min="0"
                max="480"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-stone-400">
                <span>0p</span>
                <span>4h</span>
                <span>8h</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Cảm nhận
              </label>
              <div className="flex gap-2">
                {MOOD_EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMood(i + 1)}
                    className={`text-2xl p-1 rounded transition-all ${
                      mood === i + 1
                        ? "bg-teal-100 scale-125"
                        : "hover:scale-110 opacity-50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-stone-100">
          <div className="text-sm text-stone-400">
            {editor.getText().length} ký tự
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              Huỷ
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : record ? "Cập nhật" : "Lưu bản ghi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toolbar Button Component
function ToolButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-teal-100 text-teal-700"
          : "text-stone-500 hover:bg-stone-200 hover:text-stone-700"
      }`}
    >
      {children}
    </button>
  );
}
