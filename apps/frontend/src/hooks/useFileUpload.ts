'use client'

import { useAuthFetcher } from "./useAuthFetcher";

type FileUploadResponse = {
  url: string;
  public_id: string;
}

const useFileUpload = () => {
  const { fetcher } = useAuthFetcher();

  const uploadFile = async (file: File, folder: string): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetcher(`/api/upload`, {
      method: "POST",
      body: formData,
    });

    return res;
  };

  return { uploadFile };
}

export { useFileUpload }
