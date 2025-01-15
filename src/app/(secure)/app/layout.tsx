"use client"

import { useEffect } from "react";
import { useSidebar } from "@/components/editor/hooks/useSidebar";
import Sidebar from "@/components/pannels/Sidebar";

export default function AppLayout(props: { children: React.ReactNode }) {
  const leftSidebar = useSidebar();

  // Auto Resizer
  // useEffect(() => {
  //   const resizer = () => {
  //     if (window.innerWidth > 1024 && !leftSidebar.isOpen) {
  //       leftSidebar.toggle()
  //     } else if (window.innerWidth <= 1023 && leftSidebar.isOpen) {
  //       leftSidebar.toggle()
  //     }
  //   }

  //   window.addEventListener('resize', resizer)

  //   return () => {
  //     window.removeEventListener('resize', resizer)
  //   }
  // })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 's') {
        leftSidebar.toggle()
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [leftSidebar]);

  return (
    <div className="w-full h-screen flex flex-1 relative bg-content1">
      <Sidebar
        isOpen={leftSidebar.isOpen}
        onClose={leftSidebar.toggle}
      />

      <div className="w-full h-full flex flex-col overflow-y-auto">    
        {props.children}
      </div>
    </div>
  );
}