"use client";

import { useRef, useCallback, useState, DragEvent } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImagePlus,
  Minus,
  Undo2,
  Redo,
} from "lucide-react";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  apiKey: string;
}

export function RichEditor({ value, onChange, apiKey }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        alert("画像アップロード失敗: " + (result.error || ""));
        return null;
      }
      return result.url as string;
    } catch {
      alert("画像アップロード中にエラーが発生しました");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function insertImage(file: File) {
    const url = await uploadFile(file);
    if (url && editorRef.current) {
      editorRef.current.focus();
      exec("insertHTML", `<img src="${url}" alt="" style="max-width:100%;height:auto;margin:12px 0;border-radius:4px;" /><br/>`);
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const file of imageFiles) {
      await insertImage(file);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter((item) => item.type.startsWith("image/"));
    if (imageItems.length > 0) {
      e.preventDefault();
      const files = imageItems.map((item) => item.getAsFile()).filter(Boolean) as File[];
      handleFiles(files);
    }
  }

  function insertLink() {
    const url = prompt("URLを入力してください");
    if (url) {
      exec("createLink", url);
    }
  }

  const ToolBtn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-sm transition-colors ${active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <ToolBtn onClick={() => exec("bold")} title="太字">
          <Bold size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="斜体">
          <Italic size={16} />
        </ToolBtn>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn onClick={() => exec("formatBlock", "h2")} title="見出し2">
          <Heading2 size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("formatBlock", "h3")} title="見出し3">
          <Heading3 size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("formatBlock", "p")} title="本文">
          <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">P</span>
        </ToolBtn>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="箇条書き">
          <List size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="番号付きリスト">
          <ListOrdered size={16} />
        </ToolBtn>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn onClick={insertLink} title="リンク">
          <LinkIcon size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("insertHorizontalRule")} title="区切り線">
          <Minus size={16} />
        </ToolBtn>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn
          onClick={() => fileInputRef.current?.click()}
          title="画像を挿入"
        >
          <ImagePlus size={16} />
        </ToolBtn>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn onClick={() => exec("undo")} title="元に戻す">
          <Undo2 size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("redo")} title="やり直す">
          <Redo size={16} />
        </ToolBtn>
        {uploading && (
          <span className="ml-2 text-xs text-blue-600 animate-pulse">アップロード中...</span>
        )}
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={`min-h-[300px] px-4 py-3 text-sm leading-relaxed outline-none prose prose-sm max-w-none prose-headings:text-primary prose-a:text-accent focus:ring-2 focus:ring-accent/20 ${dragOver ? "bg-blue-50 ring-2 ring-blue-300" : "bg-white"}`}
        onInput={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        dangerouslySetInnerHTML={{ __html: value }}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Drop hint */}
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-400">
        画像はドラッグ＆ドロップ、ペースト、またはツールバーのボタンから挿入できます
      </div>
    </div>
  );
}
