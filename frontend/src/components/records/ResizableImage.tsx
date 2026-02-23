"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";

export default function ResizableImage({ node, updateAttributes, selected }: NodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const width = node.attrs.width;
  const src = node.attrs.src;
  const alt = node.attrs.alt || "";

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(true);
      startX.current = e.clientX;
      startWidth.current = imgRef.current?.offsetWidth || 300;
    },
    []
  );

  useEffect(() => {
    if (!resizing) return;

    const onMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX.current;
      const newWidth = Math.max(100, startWidth.current + diff);
      updateAttributes({ width: newWidth });
    };

    const onMouseUp = () => {
      setResizing(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizing, updateAttributes]);

  return (
    <NodeViewWrapper className="resizable-image-wrapper" data-drag-handle>
      <div
        ref={containerRef}
        className={`relative inline-block ${selected ? "ring-2 ring-blue-400 rounded-lg" : ""}`}
        style={{ width: width ? `${width}px` : undefined, maxWidth: "100%" }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="block rounded-lg w-full h-auto"
          draggable={false}
        />
        {/* Resize handle - bottom right corner */}
        <div
          onMouseDown={onMouseDown}
          className="absolute bottom-1 right-1 w-4 h-4 bg-blue-500 rounded-sm cursor-nwse-resize opacity-0 hover:opacity-100 transition-opacity border-2 border-white shadow"
          style={{ opacity: selected || resizing ? 1 : undefined }}
          title="Kéo để thay đổi kích thước"
        />
        {/* Resize handle - bottom left corner */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setResizing(true);
            startX.current = e.clientX;
            startWidth.current = imgRef.current?.offsetWidth || 300;
            // For left handle, invert the direction
            const onMouseMove = (ev: MouseEvent) => {
              const diff = startX.current - ev.clientX;
              const newWidth = Math.max(100, startWidth.current + diff);
              updateAttributes({ width: newWidth });
            };
            const onMouseUp = () => {
              setResizing(false);
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
            };
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          }}
          className="absolute bottom-1 left-1 w-4 h-4 bg-blue-500 rounded-sm cursor-nesw-resize opacity-0 hover:opacity-100 transition-opacity border-2 border-white shadow"
          style={{ opacity: selected || resizing ? 1 : undefined }}
          title="Kéo để thay đổi kích thước"
        />
        {/* Width indicator when selected */}
        {selected && width && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-stone-400 bg-white px-1.5 py-0.5 rounded shadow-sm border border-stone-200">
            {Math.round(width)}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
