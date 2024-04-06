"use client"

import React from 'react'
import { Button } from '../ui/button'
import { LockClosedIcon } from '@radix-ui/react-icons'

export const LeftSidebarDocumentItem = ({ document }: any) => {
  return (
    <Button asChild variant={"ghost"}>
      <div className="w-full flex justify-between cursor-pointer">
        <div className="w-full flex gap-4">
          {document.name}
          {document.private ?
            <LockClosedIcon /> : <></>
          }
        </div>
      </div>
  </Button>
  )
}
