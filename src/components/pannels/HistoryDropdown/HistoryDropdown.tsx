import React, { memo, useCallback, useEffect, useState } from 'react'
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { FileClock } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import ExtensionKit from '@/components/editor/extensions/extension-kit';
import { watchPreviewContent } from '@tiptap-pro/extension-collaboration-history';
import { TiptapCollabProvider } from '@hocuspocus/provider';

const HistoryDropdown = memo(({ historyData, provider }: { historyData: any, provider: TiptapCollabProvider }) => {
  const [activeContent, setActiveContent] = useState<any>();
  const [currentVersionId, setCurrentVersionId] = useState(null);

  const handleVersionChange = useCallback((newVersion: any) => {
    setCurrentVersionId(newVersion?.version)

    provider.sendStateless(JSON.stringify({
      action: 'version.preview',
      version: newVersion?.version,
    }))
  }, [provider])

  const editor = useEditor({
    editable: false,
    content: '',
    extensions: [
      ...ExtensionKit(),
    ],
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full !pt-0 !pr-0 !pb-0 !pl-0 overflow-y-auto',
      },
    },
  });

  const renderDate = (date: string | number | Date) => {
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
  
    return `${day}-${month}-${year}, at ${hours}:${minutes}`
  }

  const setContent = (version: any) => {
    setActiveContent(version)
    handleVersionChange(version)
  }

  useEffect(() => {
    const unbindContentWatcher = watchPreviewContent(provider, content => {
      if (editor) {
        editor.commands.setContent(content)
      }
    })

    return () => {
      unbindContentWatcher()
    }
  }, [provider, editor])

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button asChild size={"sm"} variant={"ghost"} title="Document history">
            <FileClock />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[300px]">
          <DropdownMenuLabel>Version history</DropdownMenuLabel>

          <p className="text-sm text-muted-foreground px-2 py-1.5">
            {`These are the latest versions of your document. Click on a specific version to preview it, and eventually rollback to the said version.`}
          </p>

          <DropdownMenuSeparator />

          <div className="flex flex-col max-h-[300px] overflow-y-auto">
            {
              historyData?.versions?.length ?
              <>
                {
                  historyData?.versions?.sort(function(a: any, b: any) {
                    return b?.version - a?.version
                  })?.slice(0, 20)?.map((version: any) =>
                    <DialogTrigger asChild key={version.date} onClick={() => setContent(version)}>
                      <div className="flex flex-col gap-1.5 cursor-pointer hover:bg-muted rounded-sm px-2 py-1.5 items-start">
                        <p className="text-base font-semibold">
                          {`Version ${version?.version}`}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {renderDate(version?.date)}
                        </p>
                      </div>
                    </DialogTrigger>
                  )
                }
              </> :
              <>
                <p className="text-sm text-muted-foreground px-2 py-1.5">
                  {`There are no previous versions of your document. Start editing to automatically create a version.`}
                </p>
              </>
            }
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="z-[101] w-full h-[600px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {`Preview of Version ${activeContent?.version}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex overflow-hidden w-full">
          <div className="overflow-auto max-h-full flex-1 h-full">
            <div className="flex flex-col h-full">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <DialogFooter className="!justify-center">
          <Button>
            {`Revert to this version`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
});

HistoryDropdown.displayName = 'HistoryDropdown'

export default HistoryDropdown