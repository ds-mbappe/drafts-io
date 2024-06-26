"use client"

import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, memo, useCallback } from 'react';
import { CreateNewDocument } from "./CreateNewDocument";
import { AddExistingDocument } from "./AddExistingDocument";
import { LeftSidebarDocumentItem } from "./LeftSidebarDocumentItem";
import { Button } from "../ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input"
import Document from "@/app/models/Document";
import { useDebouncedCallback } from "use-debounce";

const Sidebar = memo(
  ({ isOpen, onClose }: { isOpen?: boolean; onClose: () => void }) => {
    const { user } = useUser();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [documents, setDocuments] = useState([])
    const [sharedDocuments, setSharedDocuments] = useState([])
    
    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose()
      }
    }, [onClose])

    const windowClassName = cn(
      'absolute top-0 left-0 mt-14 lg:mt-0 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full lg:h-auto lg:relative z-[2] w-0 duration-300 transition-all',
      'dark:bg-black lg:dark:bg-black/30',
      !isOpen && 'border-r-transparent',
      isOpen && 'w-80 border-r border-r-neutral-200 dark:border-r-neutral-800',
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
        const data = await fetch(`/api/documents/${user?.id}`, {
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
        const data = await fetch(`/api/documents/${user?.id}/shared`, {
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
      let newHoldersId = document?.holders_id?.filter((el: String) => el !== user?.id)
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

      // const res = await fetch(`/api/documents/${user?.id}?search=${e?.target?.value}`, {
      //   method: "GET",
      //   headers: { "Content-Type": "application/json" },
      // })
      // const data = await res.json()
    }, 300)

    useEffect(() => {
      if (user?.id) {
        if (!documents?.length) {
          fetchDocuments();
        }
        if (!sharedDocuments?.length) {
          fetchSharedDocuments()
        }
      }
    }, [user]);

    // if (!user) {
    //   redirect("/");
    // }

    return (
      <div className={windowClassName}>
        <div className="w-full h-full flex flex-col overflow-y-auto gap-14 py-8">
          <div className="flex flex-col gap-2 text-left px-5">
            <p className="text-lg font-semibold text-foreground">
              {`Hello, ${user?.firstName} ${user?.lastName} !`}
            </p>

            <p className="text-sm text-muted-foreground">
              {`Create new documents and manage existing ones here.`}
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5">
            <Input
              type="text"
              placeholder="Search something"
              onChange={filterDocuments}
            />

            <CreateNewDocument onDocumentSaved={() => null} />

            <AddExistingDocument onDocumentAdded={updateDocumentsList} />
          </div>

          <div className="flex flex-col gap-5">
            {/* Home button */}
            <Button asChild variant={"ghost"} className='w-full h-10 gap-4 !justify-start cursor-pointer rounded-none'>
              <Link href="/app" className="px-5">
                <p className="text-base font-semibold">
                  {`Home`}
                </p>
              </Link>
            </Button>

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
                        <LeftSidebarDocumentItem key={doc?._id} document={doc} onDocumentDeleted={onDocumentDeleted} />
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
                        <LeftSidebarDocumentItem key={doc?._id} document={doc} onDocumentRemoved={onDocumentRemoved} />
                      )
                    }
                  </div>
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