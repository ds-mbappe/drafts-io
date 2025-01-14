import { v2 as cloudinary } from "cloudinary";
import { errorToast } from "@/actions/showToast";
import { DragEvent, useCallback, useEffect, useRef, useState } from 'react';

export const useUploader = ({ onUpload }: { onUpload: (url: string) => void }) => {
  const [loading, setLoading] = useState(false)

  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true)
      const timestamp = Math.round((new Date).getTime()/1000)
      const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: "images",
      }, process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET as string )

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string)
        formData.append('signature', signature)
        formData.append('timestamp', JSON.stringify(timestamp))
        formData.append('folder', 'images')

        const result = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string}/auto/upload`, {
          method: 'POST',
          body: formData,
        })
        const data = await result.json()
        onUpload(data?.url)
      } catch (errPayload: any) {
        errorToast(errPayload?.response?.data?.error || 'Something went wrong');
      }
      setLoading(false)
    },
    [onUpload],
  )

  return { loading, uploadFile }
}

export const useFileUpload = () => {
  const fileInput = useRef<HTMLInputElement>(null)

  const handleUploadClick = useCallback(() => {
    fileInput.current?.click()
  }, [])

  return { ref: fileInput, handleUploadClick }
}

export const useDropZone = ({ uploader }: { uploader: (file: File) => void }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [draggedInside, setDraggedInside] = useState<boolean>(false)

  useEffect(() => {
    const dragStartHandler = () => {
      setIsDragging(true)
    }

    const dragEndHandler = () => {
      setIsDragging(false)
    }

    document.body.addEventListener('dragstart', dragStartHandler)
    document.body.addEventListener('dragend', dragEndHandler)

    return () => {
      document.body.removeEventListener('dragstart', dragStartHandler)
      document.body.removeEventListener('dragend', dragEndHandler)
    }
  }, [])

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      setDraggedInside(false)
      if (e.dataTransfer.files.length === 0) {
        return
      }

      const fileList = e.dataTransfer.files

      const files: File[] = []

      for (let i = 0; i < fileList.length; i += 1) {
        const item = fileList.item(i)
        if (item) {
          files.push(item)
        }
      }

      if (files.some(file => file.type.indexOf('image') === -1)) {
        return
      }

      e.preventDefault()

      const filteredFiles = files.filter(f => f.type.indexOf('image') !== -1)

      const file = filteredFiles.length > 0 ? filteredFiles[0] : undefined

      if (file) {
        uploader(file)
      }
    },
    [uploader],
  )

  const onDragEnter = () => {
    setDraggedInside(true)
  }

  const onDragLeave = () => {
    setDraggedInside(false)
  }

  return { isDragging, draggedInside, onDragEnter, onDragLeave, onDrop }
}