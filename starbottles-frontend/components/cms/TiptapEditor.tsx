"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import MediaPicker from "./MediaPicker";
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered, ImageIcon, Link as LinkIcon, Undo, Redo,
} from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const [mediaPicker, setMediaPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const insertImage = useCallback(
    (url: string) => {
      editor?.chain().focus().setImage({ src: url }).run();
    },
    [editor]
  );

  const setLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 p-2 border-b bg-muted/30 flex-wrap">
        <button className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={16} /></button>
        <button className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={16} /></button>
        <button className={btn(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1"><Heading1 size={16} /></button>
        <button className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 size={16} /></button>
        <button className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={16} /></button>
        <button className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered size={16} /></button>
        <button className={btn(false)} onClick={setLink} title="Link"><LinkIcon size={16} /></button>
        <button className={btn(false)} onClick={() => setMediaPicker(true)} title="Image"><ImageIcon size={16} /></button>
        <div className="flex-1" />
        <button className={btn(false)} onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={16} /></button>
        <button className={btn(false)} onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={16} /></button>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px]" />
      <MediaPicker open={mediaPicker} onClose={() => setMediaPicker(false)} onSelect={insertImage} />
    </div>
  );
}
