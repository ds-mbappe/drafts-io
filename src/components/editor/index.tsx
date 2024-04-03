"use client";

import { EditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";

export default function Editor() {
  const { editor } = useBlockEditor();

  return (
    <div
      onClick={() => { editor?.chain().focus().run(); }}
      className="relative flex w-full min-h-screen cursor-text flex-col items-center p-6"
    >
      {/* <div className="absolute left-8 top-8 rounded-lg bg-gray-100 px-2 py-1 text-sm text-gray-400">
        Saved
      </div> */}
      <div className="relative w-full max-w-screen-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}