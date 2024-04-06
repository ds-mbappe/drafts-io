"use client"

import React, { useEffect, useState } from 'react';
import { auth } from "@clerk/nextjs";
import Navbar from "@/components/ui/navbar";
import Editor from "@/components/editor"
import { notFound, redirect } from "next/navigation";
import { useBlockEditor } from "../../../components/editor/hooks/useBlockEditor";

type DocumentProps = {
  params: {
    id: string;
  };
};

export default function App(props: DocumentProps) {
  // const { editor, characterCount }: any = useBlockEditor();
  const [document, setDocument] = useState(null)

  const fetchDocument = async (documentId: String) => {
    const data = await fetch(`/api/document/${documentId}`, {
      method: 'GET',
      headers: { "content-type": "application/json" },
    });

    if (!data.ok) {
      notFound()
    }

    const realDoc = await data.json();
    setDocument(realDoc.document)
  }

  useEffect(() => {
    if (!document) {
      fetchDocument(props.params.id)
    }
  });

  return (
    <div className="w-full h-full flex flex-col">
      <Navbar words={0} characters={0} />
      
      <div
        // onClick={() => { editor?.chain().focus().run(); }}
        className="relative w-full flex min-h-screen cursor-text flex-col items-start p-6"
      >
        <div className="relative w-full max-w-screen-lg">
          <Editor documentId={props.params.id} documentContent={document} />
        </div>
      </div>
    </div>
  )
}