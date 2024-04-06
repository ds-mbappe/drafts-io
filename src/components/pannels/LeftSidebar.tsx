"use client"

import React, { useEffect, useState } from 'react'
import { CreateNewDocument } from '../pannels/CreateNewDocument';
import { Button } from "@/components/ui/button";
import { DragHandleHorizontalIcon } from "@radix-ui/react-icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { LeftSidebarDocumentItem } from './LeftSidebarDocumentItem';
import { useUser } from '@clerk/clerk-react';
import { redirect } from 'next/navigation';

export const LeftSidebar = () => {
  const { user } = useUser();
  
  const [sheetOpen, setSheetOpen] = useState(false)
  const [documents, setDocuments] = useState(null)

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

  useEffect(() => {
    if (user?.id) {
      if (!documents) {
        fetchDocuments();
      }
    }
  });

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
      <SheetContent className="w-72 pt-12 flex flex-col gap-4" side={"left"}>
        <SheetHeader>
          <SheetTitle>Documents</SheetTitle>
          <SheetDescription>
            Here you can create new documents, and manage existing ones.
          </SheetDescription>
        </SheetHeader>

        <CreateNewDocument onDocumentSaved={() => setSheetOpen(false)} />

        <div className="flex flex-col gap-10">
        <Accordion type="single" collapsible>
          <AccordionItem value="personal_documents">
            <AccordionTrigger>
              <p className="text-base font-semibold ">
                Personal documents
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                {
                  documents?.map((doc: any) =>
                    <LeftSidebarDocumentItem key={doc?._id} document={doc} />
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
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </div>

      </SheetContent>
    </Sheet>
  )
}
