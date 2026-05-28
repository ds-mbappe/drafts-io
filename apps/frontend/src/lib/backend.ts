const getBackendBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");
  }
  return baseUrl.replace(/\/$/, "");
};

export const backendUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl = getBackendBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

export const fetchBackend = (path: string, init?: RequestInit) =>
  fetch(backendUrl(path), init);
