"use client"

import React, { useEffect, useState } from 'react'
import { CreateNewDocument } from '../pannels/CreateNewDocument';
import { Button } from "@/components/ui/button";
import { DragHandleHorizontalIcon } from "@radix-ui/react-icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { LeftSidebarDocumentItem } from './LeftSidebarDocumentItem';
import { useUser } from '@clerk/clerk-react';
import { redirect, useRouter } from 'next/navigation';
import { HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { AddExistingDocument } from './AddExistingDocument';
import { toast } from "sonner";

export const LeftSidebar = () => {
  const { user } = useUser();
  const router = useRouter();

  const [sheetOpen, setSheetOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [sharedDocuments, setSharedDocuments] = useState([])

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

  const showToastError = (deleted: Boolean) => {
    toast(`Error`, {
      description: `There was an error ${deleted ? 'deleted' : 'removing'} the document !`,
      duration: 5000,
      important: true,
    })
  }

  const showToastSuccess = (deleted: Boolean) => {
    toast(`Info`, {
      description: `The document has been successfully ${deleted ? 'deleted' : 'removed from your shared documents'} !`,
      duration: 5000,
      important: true,
    })
  } 

  const updateDocumentsList = (data: any) => {
    let newDocs: any = [...sharedDocuments, data?.updatedDocument]
    setSharedDocuments(newDocs)
    // setSheetOpen(false)
  }

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
    <Sheet open={sheetOpen} onOpenChange={() => setSheetOpen(!sheetOpen)}>
      <SheetTrigger asChild>
        <Button size={"sm"} variant={"ghost"} >
          <DragHandleHorizontalIcon />
        </Button>
      </SheetTrigger>

      <SheetContent className="w-72 pt-12 flex flex-col gap-10 overflow-y-auto" side={"left"}>
        <SheetHeader>
          <SheetTitle>
            {`Hello, ${user?.firstName} ${user?.lastName} !`}
          </SheetTitle>
          <SheetDescription>
            Create new documents and manage existing ones here.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">
        <CreateNewDocument onDocumentSaved={() => setSheetOpen(false)} />

        <AddExistingDocument onDocumentAdded={updateDocumentsList} />
        </div>

        <div className="flex flex-col gap-5">
          <Button asChild variant={"ghost"} className='w-full gap-4 !justify-start cursor-pointer'>
            <Link href="/app">
              <HomeIcon />
              Home
            </Link>
          </Button>

          <Accordion type="single" collapsible>
            <AccordionItem value="personal_documents">
              <AccordionTrigger>
                <p className="text-base font-semibold ">
                  Personal documents
                </p>
              </AccordionTrigger>

              <AccordionContent className="flex flex-col gap-3">
                <p className="text-sm font-normal text-[#64748B]">
                  Your personnal documents are documents you have created yourself.
                </p>

                <div className="flex flex-col gap-2">
                  {
                    documents?.map((doc: any) =>
                      <LeftSidebarDocumentItem key={doc?._id} document={doc} onDocumentDeleted={onDocumentDeleted} />
                    )
                  }
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible>
            <AccordionItem value="shared_documents">
              <AccordionTrigger>
                <p className="text-base font-semibold ">
                  Shared documents
                </p>
              </AccordionTrigger>

              <AccordionContent className="flex flex-col gap-3">
                <p className="text-sm font-normal text-[#64748B]">
                  Your Shared documents are documents you have added via their document ids.
                </p>

                <div className="flex flex-col gap-2">
                  {
                    sharedDocuments?.map((doc: any) =>
                      <LeftSidebarDocumentItem key={doc?._id} document={doc} onDocumentRemoved={onDocumentRemoved} />
                    )
                  }
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </SheetContent>
    </Sheet>
  )
}
