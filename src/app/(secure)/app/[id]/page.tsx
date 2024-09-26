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
import { getSession } from 'next-auth/react';

type DocumentProps = {
  params: {
    id: string;
  };
};

// type CharacterCountType = {
//   words: Function,
//   characters: Function
// }

// interface Payload {
//   iat: number,
//   // nbf: number,
//   exp: number,
//   iss: string,
//   aud: string,
// }

export default function App(props: DocumentProps) {
  // const router = useRouter();
  // const docId = props.params.id
  const leftSidebar = useSidebar();
  // const searchParams = useSearchParams();
  const [doc, setDocument] = useState<any>(null);
  // const [words, setWords] = useState(0)
  const [user, setUser] = useState<any>()
  // const [characters, setCharacters] = useState(0)
  // const [historyData, setHistoryData] = useState({})
  // const [userFullName, setUserFullName] = useState<String>("");
  const [saveStatus, setSaveStatus] = useState<String>("Synced");
  // const [collabToken, setCollabToken] = useState<string | null>(null)
  // const [provider, setProvider] = useState<TiptapCollabProvider | null>(null)

  // const yDoc = useMemo(() => new YDoc(), [])
  // const hasCollab = parseInt(searchParams.get('noCollab') as string) !== 1

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

  // const updateHistoryData = (data: any) => {
  //   setHistoryData(data)
  // }

  // useEffect(() => {
  //   const dataFetch = async () => {
  //     const jwt = new JWT<Payload>(String(process.env.NEXT_PUBLIC_TIPTAP_CLOUD_SECRET));
  //     const token = await jwt.sign({
  //       "iat": Math.floor(Date.now() / 1000),
  //       // "nbf": Date.now() / 1000,
  //       "exp": Math.floor(Date.now() / 1000) + 86400,
  //       "iss": "https://cloud.tiptap.dev",
  //       "aud": `${String(process.env.NEXT_PUBLIC_TIPTAP_CLOUD_APP_ID)}`
  //     });
  //     setCollabToken(token)
  //   }

  //   dataFetch()
  // }, [])

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      const response = await getSession()
      setUser(response?.user)
    }

    fetchSession().catch((error) => {
      console.log(error)
    })
  }, [])

  useEffect(() => {
    fetchDocument(props?.params?.id)
  }, [props?.params?.id]);

  // useLayoutEffect(() => {
  //   if (hasCollab && collabToken && doc) {
  //     setProvider(new TiptapCollabProvider({
  //       name: `doc-${docId}`,
  //       appId: `${process.env.NEXT_PUBLIC_TIPTAP_CLOUD_APP_ID}`,
  //       token: collabToken,
  //       document: yDoc,
  //     }))
  //   }
  // }, [setProvider, collabToken, yDoc, docId, hasCollab, doc])

  // if ((hasCollab && (!collabToken || !provider))) {
  //   return null
  // }

  return (
    <div className="w-full h-[calc(100vh-65px)] flex relative">
      <Sidebar
        isOpen={leftSidebar.isOpen}
        onClose={leftSidebar.toggle}
      />

      <div className="w-full h-full flex flex-col flex-1 overflow-y-auto">
        <div className="w-full max-w-[1024px] mx-auto relative flex cursor-text flex-col z-[1] flex-1">
          <Editor
            documentId={props?.params?.id}
            doc={doc}
            currentUser={user}
            setSaveStatus={getSaveStatus}
            // yDoc={yDoc}
            // provider={provider}
            // updateHistoryData={updateHistoryData}
          />
        </div>
      </div>
    </div>
  )
}