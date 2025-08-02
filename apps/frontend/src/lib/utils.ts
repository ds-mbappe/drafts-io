import { jwtDecode } from "jwt-decode";

export function getRandomHexColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
}

export function estimateReadTimeString(wordCount: number, wordsPerMinute = 200) {
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes <= 1 ? '1 min read' : `${minutes} min read`;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function isTokenExpired(token: string) {
  try {
    const decoded: any = jwtDecode(token);
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  return response.json();
}