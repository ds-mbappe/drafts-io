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
      'absolute left-0 top-0 lg:relative z-[2] mt-14 lg:mt-0 bg-white w-0 duration-300 transition-all',
      !isOpen && 'border-r-transparent',
      isOpen && 'w-80 border-r border-r-neutral-200',
    )

    const showToastSuccess = (deleted: Boolean) => {
      toast(`Info`, {
        description: `The document has been successfully ${deleted ? 'deleted' : 'removed from your shared documents'} !`,
        duration: 5000,
        important: true,
      })
    } 

    const showToastError = (deleted: Boolean) => {
      toast(`Error`, {
        description: `There was an error ${deleted ? 'deleted' : 'removing'} the document !`,
        duration: 5000,
        important: true,
      })
    }

    const fetchDocuments = async () => {
      try {
        const data = await fetch(`/api/documents/${user?._id}`, {
          method: 'GET',
          headers: { "content-type": "application/json" },
        });
        const realDocs = await data.json();
        setDocuments(realDocs.documents)
      } catch (error) {
        console.log(error);
        toast(`Error`, {
          description: `Error fetching personal documents, please try again !`,
          duration: 5000,
          important: true,
        })
      }
    }

    const fetchSharedDocuments = async () => {
      try {
        const data = await fetch(`/api/documents/${user?._id}/shared`, {
          method: 'GET',
          headers: { "content-type": "application/json" },
        });
        const realDocs = await data.json();
        setSharedDocuments(realDocs.documents)
      } catch (error) {
        console.log(error);
        toast(`Error`, {
          description: `Error fetching shared documents, please try again !`,
          duration: 5000,
          important: true,
        })
      }
    }

    const onDocumentRemoved = async (document: any) => {
      let newHoldersId = document?.holders_id?.filter((el: String) => el !== user?._id)
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
        router.push('/app')
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

      // const res = await fetch(`/api/documents/${user?._id}?search=${e?.target?.value}`, {
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
      if (user?._id) {
        if (!documents?.length) {
          fetchDocuments();
        }
        if (!sharedDocuments?.length) {
          fetchSharedDocuments()
        }
      }
    }, [user]);

    return (
      <div className={`${windowClassName} h-full flex flex-col overflow-y-auto gap-8 py-8 ${isOpen ? 'px-2' : ''}`}>
        <Input
          key="input-search"
          type="text"
          radius="sm"
          isClearable
          placeholder={"Search"}
          startContent={<SearchIcon/>}
        />

        <div className="flex flex-col gap-4 px-5">
          <CreateNewDocument userId={user?._id} onDocumentSaved={() => null} />

          <AddExistingDocument userId={user?._id} onDocumentAdded={updateDocumentsList} />
        </div>
        
        <div>
          {/* Home button */}
          <Link href="/app">
            <div className="w-full flex px-5 py-2 flex-col">
              <p className="font-semibold">{'My Draft'}</p>
              <p className="font-normal">{'Updated at: 21:51'}</p>
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-8">
            {/* Personnal Documents */}
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold px-5">
                {`Personnal documents`}
              </p>

              <div className="w-full h-[1px] bg-muted" />

              <div className="flex flex-col gap-3">
                <p className="text-sm font-normal text-[#64748B] px-5">
                  {`Your personnal documents are documents you have created yourself.`}
                </p>

                <div className="flex flex-col gap-0.5">
                  {
                    documents?.map((doc: any) =>
                      <LeftSidebarDocumentItem key={doc?._id} userId={user?._id} document={doc} onDocumentDeleted={onDocumentDeleted} />
                    )
                  }
                </div>
              </div>
            </div>

            {/* Shared Documents */}
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold px-5">
                {`Shared documents`}
              </p>

              <div className="w-full h-[1px] bg-muted" />

              <div className="flex flex-col gap-3">
                <p className="text-sm font-normal text-[#64748B] px-5">
                  {`Your Shared documents are documents you have added via their document ids.`}
                </p>

                <div className="flex flex-col gap-0.5">
                  {
                    sharedDocuments?.map((doc: any) =>
                      <LeftSidebarDocumentItem key={doc?._id} userId={user?._id} document={doc} onDocumentRemoved={onDocumentRemoved} />
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