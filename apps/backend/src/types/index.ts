export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export type UploadProgressCallback = (progress: {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
}) => void;
