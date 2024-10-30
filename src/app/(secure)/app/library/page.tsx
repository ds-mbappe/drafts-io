"use client"

import DocumentCard from '@/components/card/DocumentCard';
import { useSidebar } from '@/components/editor/hooks/useSidebar';
import Sidebar from '@/components/pannels/Sidebar';
import { Spinner } from '@nextui-org/react'
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const Library = () => {
  const [loading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const leftSidebar = useSidebar();
  const params = useSearchParams();
  const userId = params?.get('id');

  useEffect(() => {
    const resizer = () => {
      if (window.innerWidth > 1024 && !leftSidebar.isOpen) {
        leftSidebar.toggle()
      } else if (window.innerWidth <= 1023 && leftSidebar.isOpen) {
        leftSidebar.toggle()
      }
    }

    window.addEventListener('resize', resizer)

    return () => {
      window.removeEventListener('resize', resizer)
    }
  })

  const fetchDocuments = async () => {
    setIsLoading(true);
    const data = await fetch(`/api/documents/${userId}`, {
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
    setIsLoading(false)
  }

  useEffect(() => {
    const justFetch = async() => {
      await fetchDocuments()
    }

    justFetch();
  }, []);

  return (
    <div className="w-full h-screen flex flex-1 relative">
      <Sidebar
        isOpen={leftSidebar.isOpen}
        onClose={leftSidebar.toggle}
      />
      
      <div className="w-full max-w-[1024px] mx-auto px-4 lg:px-0 flex flex-col my-8 gap-3">
        <p className="text-sm font-normal text-foreground-500">
          {`This is the list of all the documents you have created, wheter you published them or not. You can manage them (edit, publish, delete) right from here.`}
        </p>

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
                {`You have not created a document yet, start by clicking the button at the bottom right of your screen.`}
              </p>
            }
          </>
        }
      </div>
    </div>
  )
}

export default Library