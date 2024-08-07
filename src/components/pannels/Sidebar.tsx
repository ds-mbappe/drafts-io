"use client"

import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, memo, useCallback } from 'react';
import { CreateNewDocument } from "./CreateNewDocument";
import { AddExistingDocument } from "./AddExistingDocument";
import { LeftSidebarDocumentItem } from "./LeftSidebarDocumentItem";
import { useDebouncedCallback } from "use-debounce";
import { Input, Button } from "@nextui-org/react";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { getSession } from "next-auth/react";

const Sidebar = memo(({ isOpen, onClose }: { isOpen?: boolean; onClose: () => void }) => {
    const router = useRouter();
    const [user, setUser] = useState<any>()
    const [search, setSearch] = useState("");
    const [documents, setDocuments] = useState([])
    const [sharedDocuments, setSharedDocuments] = useState([])
    
    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose()
      }
    }, [onClose])

    const windowClassName = cn(
      'absolute left-0 top-0 lg:relative z-[2] mt-14 lg:mt-0 w-0 duration-300 transition-all',
      !isOpen && 'border-r-transparent',
      isOpen && 'w-80 border-r',
    )

    const showToastSuccess = (deleted: Boolean) => {
      toast.success(`Info`, {
        description: `The document has been successfully ${deleted ? 'deleted' : 'removed from your shared documents'} !`,
        duration: 5000,
        important: true,
      })
    } 

    const showToastError = (deleted: Boolean) => {
      toast.error(`Error`, {
        description: `There was an error ${deleted ? 'deleted' : 'removing'} the document !`,
        duration: 5000,
        important: true,
      })
    }

    const fetchDocuments = async () => {
      const data = await fetch(`/api/documents/${user?.email}`, {
        method: 'GET',
        headers: { "content-type": "application/json" },
      });
      
      if (data?.ok) {
        const realDocs = await data.json();
        setDocuments(realDocs.documents)
      } else {
        toast(`Error`, {
          description: `Error fetching personal documents, please try again !`,
          duration: 5000,
          important: true,
        })
      }
    }

    const fetchSharedDocuments = async () => {
      const data = await fetch(`/api/documents/${user?.email}/shared`, {
        method: 'GET',
        headers: { "content-type": "application/json" },
      });

      if (data?.ok) {
        const realDocs = await data.json();
        setSharedDocuments(realDocs.documents)
      } else {
        toast(`Error`, {
          description: `Error fetching shared documents, please try again !`,
          duration: 5000,
          important: true,
        })
      }
    }

    const onDocumentRemoved = async (document: any) => {
      let newHoldersId = document?.holders_id?.filter((el: String) => el !== user?.email)
      const res = await fetch(`/api/document/${document?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          holders_id: newHoldersId
        }),
      })
  
      if (!res.ok) {
        showToastError(false)
      } else {
        showToastSuccess(false)

        const newDocsShared = sharedDocuments?.filter(doc => doc?._id !== document?._id)
        setSharedDocuments(newDocsShared)
        router.push('/app')
      }
    }

    const onDocumentDeleted = async (document: any) => {
      const res = await fetch(`/api/document/${document?._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
  
      if (!res.ok) {
        showToastError(true)
      } else {
        showToastSuccess(true)

        const newDocs = documents?.filter(doc => doc?._id !== document?._id)
        setDocuments(newDocs)
        router.push('/app')
      }
    }

    const onDocumentEdited = async (document: any) => {
      let editedDocument: any = documents?.find((doc: any) => doc?._id === document?._id)
      if (editedDocument) {
        editedDocument.name = document?.name
      }
    }

    const updateDocumentsList = (data: any) => {
      let newDocs: any = [...sharedDocuments, data?.updatedDocument]
      setSharedDocuments(newDocs)
    }

    const filterDocuments = useDebouncedCallback(async(e: any) => {
      // let dataPersonal = documents
      // let dataShared = sharedDocuments

      // dataPersonal = dataPersonal.filter((doc: any) => doc?.name?.toLowerCase()?.startsWith(e.target.value))
      // dataShared = dataShared.filter((doc: any) => doc?.name?.toLowerCase()?.startsWith(e.target.value))

      // const res = await fetch(`/api/documents/${user?.email}?search=${e?.target?.value}`, {
      //   method: "GET",
      //   headers: { "Content-Type": "application/json" },
      // })
      // const data = await res.json()
    }, 300)

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
      if (user?.email) {
        if (!documents?.length) {
          fetchDocuments();
        }
        if (!sharedDocuments?.length) {
          fetchSharedDocuments()
        }
      }
    }, [user]);

    return (
      <div className={`${windowClassName} h-full bg-content1 flex flex-col overflow-y-auto gap-8 py-8 ${isOpen ? 'px-2' : ''}`}>
        <Input
          key="input-search"
          variant="bordered"
          type="text"
          className="px-4"
          isClearable
          placeholder={"Search"}
          startContent={<SearchIcon/>}
        />

        <div className="flex flex-col gap-4 px-4">
          <CreateNewDocument email={user?.email} onDocumentSaved={() => null} />

          <AddExistingDocument email={user?.email} onDocumentAdded={updateDocumentsList} />
        </div>
        
        {/* Home button */}
        <Link href="/app">
          <div className="w-full flex px-4 py-2 flex-col rounded-md hover:bg-foreground-100">
            <p className="font-semibold">{'My Draft'}</p>
            <p className="font-normal">{'Updated at: 21:51'}</p>
          </div>
        </Link>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-8">
            {/* Personnal Documents */}
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold px-4">
                {`Personnal documents`}
              </p>

              <div className="w-full h-[1px] bg-muted" />

              <div className="flex flex-col gap-3">
                <p className="text-sm font-normal text-[#64748B] px-4">
                  {`Your personnal documents are documents you have created yourself.`}
                </p>

                <div className="flex flex-col gap-0.5">
                  {
                    documents?.map((doc: any) =>
                      <LeftSidebarDocumentItem
                        key={doc?._id}
                        email={user?.email}
                        document={doc}
                        onDocumentEdited={onDocumentEdited}
                        onDocumentDeleted={onDocumentDeleted}
                      />
                    )
                  }
                </div>
              </div>
            </div>

            {/* Shared Documents */}
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold px-4">
                {`Shared documents`}
              </p>

              <div className="w-full h-[1px] bg-muted" />

              <div className="flex flex-col gap-3">
                <p className="text-sm font-normal text-[#64748B] px-4">
                  {`Your Shared documents are documents you have added via their document ids.`}
                </p>

                <div className="flex flex-col gap-0.5">
                  {
                    sharedDocuments?.map((doc: any) =>
                      <LeftSidebarDocumentItem
                        key={doc?._id}
                        email={user?.email}
                        document={doc}
                        onDocumentEdited={onDocumentEdited}
                        onDocumentRemoved={onDocumentRemoved}
                      />
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

Sidebar.displayName = 'ContentSidebar'

export default Sidebar