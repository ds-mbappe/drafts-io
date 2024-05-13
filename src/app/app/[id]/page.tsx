"use client"

import React, { useEffect, useState } from 'react';
import { auth } from "@clerk/nextjs";
import Navbar from "@/components/ui/navbar";
import Editor from "@/components/editor"
import { notFound, redirect } from "next/navigation";

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
  const [document, setDocument] = useState(null)
  const [words, setWords] = useState(0)
  const [characters, setCharacters] = useState(0)
  const [saveStatus, setSaveStatus] = useState<String>("Saved");

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
  }

  useEffect(() => {
    fetchDocument(props.params.id)
  }, [props.params.id]);

  return (
    <div className="w-full h-full flex flex-col">
      <Navbar words={words} characters={characters} status={saveStatus} />
      
      <div
        // onClick={() => { editor?.chain().focus().run(); }}
        className="relative w-full flex min-h-screen cursor-text flex-col items-start p-6"
      >
        <div className="relative w-full max-w-screen-lg">
          <Editor
            documentId={props.params.id}
            documentContent={document}
            setCharacterCount={getCharacterAndWordsCount}
            setSaveStatus={getSaveStatus}
          />
        </div>
      </div>
    </div>
  )
}