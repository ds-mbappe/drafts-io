import { useEffect, useState } from "react";

export function useMobile() {
  const [isLargeScreen, setIsLargeScreen] = useState(() => window.innerWidth > 640);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isLargeScreen;
}
