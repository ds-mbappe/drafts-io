import { useEffect } from "react";

export function useEscapeKey(handler: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handler, enabled]);
}
