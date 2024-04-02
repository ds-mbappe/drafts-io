"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function Editor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
  });

  return (
    <div
      onClick={() => { editor?.chain().focus().run(); }}
      className="relative flex min-h-screen w-full cursor-text flex-col items-center p-32"
    >
      <div className="absolute left-8 top-8 rounded-lg bg-gray-100 px-2 py-1 text-sm text-gray-400">
        Saved {/* {saveStatus} */}
      </div>
      <div className="relative w-full max-w-screen-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}