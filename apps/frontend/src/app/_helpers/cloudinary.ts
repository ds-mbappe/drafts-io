import { v2 as cloudinary } from "cloudinary";

export const uploadFileToCloudinary = async (file: File | undefined) => {
  const timestamp = Math.round((new Date).getTime()/1000)
  const folder = `${process.env.NODE_ENV}/cover_urls`
  const signature = cloudinary.utils.api_sign_request({
    folder: folder,
    timestamp: timestamp,
  }, process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET as string)

  if (file) {
    const formData = new FormData()
  
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('signature', signature)
    formData.append('timestamp', JSON.stringify(timestamp))
    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string)
  
    const result = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string}/auto/upload`, {
      method: 'POST',
      body: formData,
    })

    if (result?.ok) {
      const data = await result.json()
  
      return data?.secure_url;
    } else {
      return '';
    }
  }

  return '';
}