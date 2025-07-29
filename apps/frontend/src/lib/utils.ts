import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomHexColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
}

export function estimateReadTimeString(wordCount: number, wordsPerMinute = 200) {
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes <= 1 ? '1 min read' : `${minutes} min read`;
}