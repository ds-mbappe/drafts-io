import { cn } from '@/lib/utils';
import { ChangeEvent, useCallback } from 'react';
import { Spinner, Button } from "@heroui/react";
import { ImageIcon, UploadIcon } from 'lucide-react';
import { useDropZone, useFileUpload, useUploader } from './hooks';

export const ImageUploader = ({ onUpload }: { onUpload: (url: string) => void }) => {
  const { loading, uploadFile } = useUploader({ onUpload })
  const { handleUploadClick, ref } = useFileUpload()
  const { draggedInside, onDrop, onDragEnter, onDragLeave } = useDropZone({ uploader: uploadFile })

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => (e.target.files ? uploadFile(e.target.files[0]) : null),
    [uploadFile],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-lg min-h-40">
        <Spinner size="lg" color="secondary" />
      </div>
    )
  }

  const wrapperClass = cn(
    'w-full max-w-[600px] h-[300px] mx-auto flex flex-col items-center justify-center p-5 gap-4 border border-divider rounded-lg bg-foreground-100',
    draggedInside && 'bg-neutral-100',
  )

  return (
    <div
      className={wrapperClass}
      onDrop={onDrop}
      onDragOver={onDragEnter}
      onDragLeave={onDragLeave}
      contentEditable={false}
    >
      <ImageIcon width={60} height={60} className="text-content1-foreground" />

      <div className="flex flex-col items-center justify-center gap-8">
        <p className="text-sm font-medium text-center text-content1-foreground">
          {draggedInside ? 'Drop image here' : 'Drag and drop or'}
        </p>

        {!draggedInside &&
          <div>
            <Button
              isDisabled={draggedInside}
              onClick={handleUploadClick}
              variant="bordered"
              startContent={<UploadIcon width={16} height={16} />}
            >
              <p className="text-content1-foreground font-medium">
                {'Upload an image'}
              </p>
            </Button>
          </div>
        }
      </div>
      
      <input
        className="w-0 h-0 overflow-hidden opacity-0"
        ref={ref}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={onFileChange}
      />
    </div>
  )
}

export default ImageUploader