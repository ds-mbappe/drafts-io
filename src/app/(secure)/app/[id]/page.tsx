"use client"

import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import NavbarApp from "@/components/ui/navbar";
import Editor from "@/components/editor"
import { Doc as YDoc } from 'yjs'
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from '@/components/pannels/Sidebar';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { JWT } from "node-jsonwebtoken";
import { useSidebar } from '@/components/editor/hooks/useSidebar';
import 'katex/dist/katex.min.css';
import { toast } from 'sonner';

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
  const router = useRouter();
  const leftSidebar = useSidebar()
  const searchParams = useSearchParams()
  const [doc, setDocument] = useState<any>(null)
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

    if (data?.ok) {
      const realDoc = await data.json();
      setDocument(realDoc?.document)
    } else {
      toast.error(`Error`, {
        description: `An error occured, please try again !`,
        duration: 3000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      })
      // router.push("/not-found")
    }
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
        "aud": `${String(process.env.NEXT_PUBLIC_TIPTAP_CLOUD_APP_ID)}`
      });
      setCollabToken(token)
    }

    dataFetch()
  }, [])

  useEffect(() => {
    fetchDocument(props.params.id)
  }, [props.params.id]);

  const yDoc = useMemo(() => new YDoc(), [])

  useLayoutEffect(() => {
    if (hasCollab && collabToken && doc) {
      setProvider(new TiptapCollabProvider({
        name: `doc-${docId}`,
        appId: `${process.env.NEXT_PUBLIC_TIPTAP_CLOUD_APP_ID}`,
        token: collabToken,
        document: yDoc,
      }))
    }
  }, [setProvider, collabToken, yDoc, docId, hasCollab, doc])

  if ((hasCollab && (!collabToken || !provider))) {
    return null
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <NavbarApp
        words={words}
        status={saveStatus}
        characters={characters}
        isSidebarOpen={leftSidebar.isOpen}
        toggleSidebar={leftSidebar.toggle}
        historyData={historyData}
        provider={provider}
        document={doc}
      />
      
      <div className="flex flex-1 h-full">
        <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} />

        <div className="w-full bg-content1 relative flex overflow-y-auto cursor-text flex-col items-start z-[1] flex-1 p-0 lg:p-6">
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