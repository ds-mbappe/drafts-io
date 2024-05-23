"use client"

import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import Editor from "@/components/editor"
import { Doc as YDoc } from 'yjs'
import { useUser } from '@clerk/nextjs';
import { notFound, redirect, useSearchParams } from "next/navigation";
import Sidebar from '@/components/pannels/Sidebar';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { JWT } from "node-jsonwebtoken";
import { useSidebar } from '@/components/editor/hooks/useSidebar';
import 'katex/dist/katex.min.css';

type DocumentProps = {
  params: {
    id: string;
  };
};

type CharacterCountType = {
  words: Function,
  characters: Function
}

interface Payload {
  iat: number,
  // nbf: number,
  exp: number,
  iss: string,
  aud: string,
}

export default function App(props: DocumentProps) {
  const docId = props.params.id
  const { user } = useUser();
  const leftSidebar = useSidebar()
  const searchParams = useSearchParams()
  const [doc, setDocument] = useState(null)
  const [words, setWords] = useState(0)
  const [characters, setCharacters] = useState(0)
  const [historyData, setHistoryData] = useState({})
  const [userFullName, setUserFullName] = useState<String>("");
  const [saveStatus, setSaveStatus] = useState<String>("");
  const [collabToken, setCollabToken] = useState<string | null>(null)
  const [provider, setProvider] = useState<TiptapCollabProvider | null>(null)

  const hasCollab = parseInt(searchParams.get('noCollab') as string) !== 1

  const getCharacterAndWordsCount = (characterCount: CharacterCountType) => {
    setWords(characterCount?.words())
    setCharacters(characterCount?.characters())
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
  }

  const updateHistoryData = (data: any) => {
    setHistoryData(data)
  }

  useEffect(() => {
    const dataFetch = async () => {
      const jwt = new JWT<Payload>(String(process.env.NEXT_PUBLIC_TIPTAP_CLOUD_SECRET));
      const token = await jwt.sign({
        "iat": Math.floor(Date.now() / 1000),
        // "nbf": Date.now() / 1000,
        "exp": Math.floor(Date.now() / 1000) + 86400,
        "iss": "https://cloud.tiptap.dev",
        "aud": `${process.env.NEXT_PUBLIC_TIPTAP_CLOUD_APP_ID}`
      });
      // console.log(token)
      setCollabToken(token)
    }

    dataFetch()
  }, [])

  useEffect(() => {
    fetchDocument(props.params.id)
  }, [props.params.id]);

  const yDoc = useMemo(() => new YDoc(), [])

  useLayoutEffect(() => {
    if (hasCollab && collabToken) {
      setProvider(new TiptapCollabProvider({
        name: `doc-${docId}`,
        appId: `${process.env.NEXT_PUBLIC_TIPTAP_CLOUD_APP_ID}`,
        token: collabToken,
        document: yDoc,
      }))

      setUserFullName(`${user?.fullName}`)
    }
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
        historyData={historyData}
        provider={provider}
      />
      
      <div className="flex h-full">
        <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} />

        <div className="relative flex min-h-screen cursor-text flex-col items-start z-[1] flex-1 p-0 lg:p-6">
          <div className="relative w-full max-w-screen-xl">
            <Editor
              documentId={props.params.id}
              documentContent={doc}
              setCharacterCount={getCharacterAndWordsCount}
              setSaveStatus={getSaveStatus}
              yDoc={yDoc}
              provider={provider}
              userFullName={userFullName}
              updateHistoryData={updateHistoryData}
            />
          </div>
        </div>
      </div>
    </div>
  )
}