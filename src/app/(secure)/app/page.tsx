"use client";

import 'katex/dist/katex.min.css';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { SearchIcon, SquarePenIcon } from 'lucide-react';
import DocumentCard from '@/components/card/DocumentCard';
import { errorToast, successToast } from '@/actions/showToast';
import { Button, Input, Tabs, Tab, Spinner } from "@nextui-org/react";
import { NextSessionContext } from '@/contexts/SessionContext';

export default function App() {
  const router = useRouter();
  const nextSession = useContext(NextSessionContext)
  const [loading, setIsLoading] = useState(false)
  const [loadingLatest, setIsLoadingLatest] = useState(false)
  const [documents, setDocuments] = useState([])
  const [latestDocuments, setLatestDocuments] = useState([])

  // Fetch documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    const data = await fetch(`/api/documents/${nextSession?.user?.id}`, {
      method: 'GET',
      headers: { "content-type": "application/json" },
    });
    
    if (data?.ok) {
      const realDocs = await data.json();
      setDocuments(realDocs.documents)
    } else {
      errorToast("Error fetching documents, please try again!");
    }
    setIsLoading(false)
  }

  const goToNewDocument = async () => {
    let formData = {
      title: `Untitled_${new Date()}`,
      authorId: nextSession?.user?.id,
      authorAvatar: nextSession?.user?.avatar,
      authorFirstname: nextSession?.user?.firstname,
      authorLastname: nextSession?.user?.lastname,
      cover: null,
      topic: null,
    }

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })

    if (res?.ok) {
      await res.json().then((data) => {
        successToast("Document created successfully!");

        router.push(`/app/${data?.document?.id}`)
      })
    } else {
      errorToast("Error creating new document, please try again!");
    }
  }

  // Fetch latest documents
  useEffect(() => {
    const fetchLatestDocuments = async() => {
      setIsLoadingLatest(true)
      const res = await fetch("/api/documents", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json();
      
      if (!res.ok) {
        errorToast("Error fetching documents, please verify your network and try again.");
      } else {
        setLatestDocuments(data?.documents);
      }
      setIsLoadingLatest(false)
    }

    fetchLatestDocuments();
  }, [])

  // Fetch user documents
  useEffect(() => {
    if (nextSession?.user?.id) {
      const justFetch = async() => {
        await fetchDocuments()
      }

      justFetch();
    }
  }, []);

  return (
    <div className="w-full h-screen flex flex-1 relative">
      <div className="w-full h-full flex flex-col overflow-y-auto">
        <div className="w-full max-w-[768px] 2xl:max-w-[1024px] mx-auto relative flex cursor-text flex-col gap-2 z-[1] flex-1 px-5 2xl:!px-0 pt-10 pb-5">
          <Tabs
            key="tabs"
            color="primary"
            variant="underlined"
            aria-label="Tabs"
            fullWidth
            classNames={{
              tabList: "w-full p-0 border-b border-divider",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            <Tab key="latest" title={`Discover`} className="flex flex-col gap-4">
              {loadingLatest ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <>
                  { latestDocuments?.length ?
                    <div className="w-full flex flex-col gap-4 md:!grid md:!grid-cols-2">
                      {
                        latestDocuments?.map((document, index) => {
                          return <DocumentCard key={index} document={document} />
                        })
                      }
                    </div> :
                    <p className="text-sm font-normal text-foreground-500">
                      {`There is no public document for now, come back later ;).`}
                    </p>
                  }
                </>
              }
            </Tab>

            <Tab key="for_you" title={`Following`} className="flex flex-col gap-4">
              {loading ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <>
                  { documents?.length ?
                    <div className="w-full flex flex-col gap-4 md:!grid md:!grid-cols-2">
                      {
                        documents?.map((document, index) => {
                          return <DocumentCard key={index} document={document} />
                        })
                      }
                    </div> :
                    <p className="text-sm font-normal text-foreground-500">
                      {`You are currently not following anybody. Start following people to see their posts`}
                    </p>
                  }
                </>
              }
            </Tab>

            <Tab key="tag_1" title={`Tag 1`} className="flex flex-col gap-4">
              {loading ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <p className="text-sm font-normal text-foreground-500">
                  {`They are currently no document associated with this tag, please come back a little later.`}
                </p>
              }
            </Tab>

            <Tab key="tag_2" title={`Tag 2`} className="flex flex-col gap-4">
              {loading ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <p className="text-sm font-normal text-foreground-500">
                  {`They are currently no document associated with this tag, please come back a little later.`}
                </p>
              }
            </Tab>

            <Tab key="tag_3" title={`Tag 3`} className="flex flex-col gap-4">
              {loading ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <p className="text-sm font-normal text-foreground-500">
                  {`They are currently no document associated with this tag, please come back a little later.`}
                </p>
              }
            </Tab> 
          </Tabs>
        </div>
      </div>

      <Button
        variant="shadow"
        radius="full"
        color="primary"
        startContent={<SquarePenIcon />}
        className="fixed bottom-4 right-4 z-[99]"
        onClick={goToNewDocument}
      >
        {'New draft'}
      </Button>
    </div>
  )
}