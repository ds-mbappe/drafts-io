import { useEffect, useState } from "react";

export function useMobile() {
  const [isLargeScreen, setIsLargeScreen] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isLargeScreen;
}
