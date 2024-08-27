"use client"

import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, memo, useCallback } from 'react';
import { CreateNewDocument } from "./CreateNewDocument";
import { AddExistingDocument } from "./AddExistingDocument";
import { LeftSidebarDocumentItem } from "./LeftSidebarDocumentItem";
import { useDebouncedCallback } from "use-debounce";
import { Input, Button, Divider } from "@nextui-org/react";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { getSession } from "next-auth/react";

const Sidebar = memo(({ isOpen, onClose }: { isOpen?: boolean; onClose: () => void }) => {
    const router = useRouter();
    const [user, setUser] = useState<any>()
    const [search, setSearch] = useState("");
    const [documents, setDocuments] = useState([])
    
    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose()
      }
    }, [onClose])

    const windowClassName = cn(
      'absolute left-0 top-0 xl:relative z-[2] mt-14 xl:mt-0 w-0 duration-300 transition-all',
      !isOpen && 'border-r-transparent',
      isOpen && 'w-80 border-r border-r-divider',
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
        toast.error(`Error`, {
          description: `Error fetching documents, please try again!`,
          duration: 5000,
          important: true,
        })
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

        const newDocs = documents?.filter((doc: any) => doc?._id !== document?._id)
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

    // Search
    const filterDocuments = useDebouncedCallback(async(e: any) => {
      // let dataPersonal = documents

      // dataPersonal = dataPersonal.filter((doc: any) => doc?.name?.toLowerCase()?.startsWith(e.target.value))

      // const res = await fetch(`/api/documents/${user?.email}?search=${e?.target?.value}`, {
      //   method: "GET",
      //   headers: { "Content-Type": "application/json" },
      // })
      // const data = await res.json()
    }, 300)

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

    // Fetch documents
    useEffect(() => {
      if (user?.email) {
        const justFetch = async() => {
          await fetchDocuments()
        }
  
        justFetch();
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

        {/* <div className="flex flex-col gap-4 px-4">
          <CreateNewDocument email={user?.email} onDocumentSaved={() => null} />

          <AddExistingDocument email={user?.email} onDocumentAdded={updateDocumentsList} />
        </div> */}
        
        {/* Home button */}
        <Link href="/app">
          <div className="w-full flex px-4 py-2 flex-col rounded-md hover:bg-foreground-100">
            <p className="font-semibold">{'Home'}</p>
          </div>
        </Link>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            {/* Documents */}
            <div className="flex flex-col">
              <p className="text-base font-semibold px-4">
                {`My personnal documents`} {`(${documents?.length})`}
              </p>
              
              <p className="text-sm font-normal text-foreground-500 px-4">
                {`Here, a list of all your creations.`}
              </p>
            </div>

            <Divider />

            <div className="flex flex-col gap-3">

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
        </div>
      </div>
    )
  },
)

Sidebar.displayName = 'ContentSidebar'

export default Sidebar