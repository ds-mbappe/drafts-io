"use client"

import { getSession } from 'next-auth/react';
import { errorToast } from '@/actions/showToast';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Spinner, Tab, Tabs } from '@nextui-org/react';
import DocumentCardInLibrary from '@/components/card/DocumentCardInLibrary';

const Library = () => {
  const [loading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [user, setUser] = useState<any>();
  const params = useSearchParams();

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

  const fetchDocuments = async () => {
    setIsLoading(true);
    const data = await fetch(`/api/documents/${user?.id}/library`, {
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

  useEffect(() => {
    const justFetch = async() => {
      await fetchDocuments()
    }

    justFetch();
  }, [user?.id]);

  return (
    <div className="w-full h-screen flex flex-1 relative mt-4 mb-10">
      <div className="w-full max-w-[768px] 2xl:max-w-[1024px] mx-auto px-4 lg:px-0 flex flex-col">
        <Tabs aria-label="Tabs variants" variant="underlined" color="primary">
          <Tab key="documents" title="Documents">
            <div className="w-full flex flex-col gap-5">
              <p className="text-sm font-normal text-foreground-500">
                {`This is the list of all the documents you have created, wheter you published them or not. You can manage them (edit, publish, delete) right from here.`}
              </p>

              {loading ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <>
                  { documents?.length ?
                    <div className="w-full flex flex-wrap gap-5">
                      {
                        documents?.map((document, index) => {
                          return <DocumentCardInLibrary key={index} document={document} />
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
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}

export default Library