"use client"

import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import Editor from "@/components/editor"
import { Doc as YDoc } from 'yjs'
import { useUser } from '@clerk/nextjs';
import { notFound, redirect, useSearchParams } from "next/navigation";
import Sidebar from '@/components/pannels/Sidebar';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { useBlockEditor } from '@/components/editor/hooks/useBlockEditor';

type DocumentProps = {
  params: {
    id: string;
  };
};

type CharacterCountType = {
  words: Function,
  characters: Function
}

export default function App(props: DocumentProps) {
  const docId = props.params.id
  const { user } = useUser();
  const searchParams = useSearchParams()
  const { leftSidebar } = useBlockEditor();
  const [doc, setDocument] = useState(null)
  const [words, setWords] = useState(0)
  const [characters, setCharacters] = useState(0)
  const [userFullName, setUserFullName] = useState<String>("");
  const [saveStatus, setSaveStatus] = useState<String>("Synced");
  const [collabToken, setCollabToken] = useState<string | null>(null)
  const [provider, setProvider] = useState<TiptapCollabProvider | null>(null)

  const hasCollab = parseInt(searchParams.get('noCollab') as string) !== 1

  const getCharacterAndWordsCount = (characterCount: CharacterCountType) => {
    setWords(characterCount.words())
    setCharacters(characterCount.characters())
  }

  const getSaveStatus = (status: String) => {
    setSaveStatus(status)
  }

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
    setCollabToken(String(process.env.NEXT_PUBLIC_TIPTAP_CLOUD_TOKEN))
  }

  useEffect(() => {
    fetchDocument(props.params.id)
  }, [props.params.id]);

  const yDoc = useMemo(() => new YDoc(), [])

  useLayoutEffect(() => {
    setProvider(
      new TiptapCollabProvider({
        name: `doc-${docId}`,
        appId: `${process.env.NEXT_PUBLIC_TIPTAP_CLOUD_APP_ID}`,
        token: collabToken,
        document: yDoc,
      }),
    )
    setUserFullName(`${user?.fullName}`)
  }, [setProvider, collabToken, yDoc, docId, hasCollab])

  if ((hasCollab && (!collabToken || !provider))) return

  return (
    <div className="w-full h-full flex flex-col">
      <Navbar
        words={words}
        status={saveStatus}
        characters={characters}
        isSidebarOpen={leftSidebar.isOpen}
        toggleSidebar={leftSidebar.toggle}
      />
      
      <div className="flex h-full">
        <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} />

        <div
          // onClick={() => { editor?.chain().focus().run(); }}
          className="relative flex min-h-screen cursor-text flex-col items-start z-[1] flex-1 p-6"
        >
          <div className="relative w-full max-w-screen-xl">
            <Editor
              documentId={props.params.id}
              documentContent={doc}
              setCharacterCount={getCharacterAndWordsCount}
              setSaveStatus={getSaveStatus}
              yDoc={yDoc}
              provider={provider}
              userFullName={userFullName}
            />
          </div>
        </div>
      </div>
    </div>
  )
}