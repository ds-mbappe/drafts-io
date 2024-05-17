import React, { memo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const HistoryDropdownItem = memo(({ version, provider }: any) => {

  const renderDate = (date: string | number | Date) => {
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
  
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
  
    return `${day}-${month}-${year}, at ${hours}:${minutes}`
  }

  return (
    <div className="flex flex-col gap-1.5 cursor-pointer hover:bg-muted rounded-sm px-2 py-1.5 items-start">
      <p className="text-base font-semibold">
        {`Version - ${version?.version}`}
      </p>

      <p className="text-sm text-muted-foreground">
        {renderDate(version?.date)}
      </p>
    </div>
    // <Dialog>
    //   <DialogTrigger>
    //   </DialogTrigger>

    //   <DialogContent asChild className="max-w-[80%] h-full max-h-[75%]">
    //     <div className="flex flex-col gap-5">
    //       Hello this is my content
    //     </div>
    //   </DialogContent>
    // </Dialog>









    
  //   <DropdownMenu>
  //   <DropdownMenuTrigger>
  //     <Button asChild size={"sm"} variant={"ghost"} title="Document history">
  //       <FileClock />
  //     </Button>
  //   </DropdownMenuTrigger>

  //   <DropdownMenuContent className='w-[300px]'>
  //     <DropdownMenuLabel>Version history</DropdownMenuLabel>

  //     <p className="text-sm text-muted-foreground px-2 py-1.5">
  //       {`These are the latest versions of your document. Click on a specific version to preview it, and eventually rollback to the said version.`}
  //     </p>

  //     <DropdownMenuSeparator />

  //     <div className="flex flex-col max-h-[300px] overflow-y-auto">
  //       {
  //         data?.historyData?.versions?.length ?
  //         <>
  //           {
  //             data?.historyData?.versions?.sort(function(a: any, b: any) {
  //               return b?.version - a?.version
  //             })?.map((version: any) =>
  //               <HistoryDropdownItem key={version.date} version={version} />
  //             )
  //           }
  //         </> :
  //         <>
  //           <p className="text-sm text-muted-foreground px-2 py-1.5">
  //             {`There are no previous versions of your document. Start editing to automatically create a version.`}
  //           </p>
  //         </>
  //       }
  //     </div>
  //   </DropdownMenuContent>
  // </DropdownMenu>
  )
});

HistoryDropdownItem.displayName = 'HistoryDropdownItem'

export default HistoryDropdownItem