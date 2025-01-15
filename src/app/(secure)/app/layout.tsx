"use client"

import { useEffect, useState } from "react";
import { useSidebar } from "@/components/editor/hooks/useSidebar";
import Sidebar from "@/components/pannels/Sidebar";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import { NextSessionContext } from "@/contexts/SessionContext";

export default function AppLayout(props: { children: React.ReactNode }) {
  const leftSidebar = useSidebar();
  const [session, setSession] = useState<Session | null>();
  const contextValue = { session, setSession }

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

  // Sidebar hook
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

  // Fetch NextAuth session
  useEffect(() => {
    const fetchSession = async () => {
      const response = await getSession()
      setSession(response);
    }

    fetchSession().catch((error) => {
      console.log(error)
    })
  }, [])

  return (
    <NextSessionContext.Provider value={contextValue}>
      <div className="w-full h-screen flex flex-1 relative bg-content1">
        <Sidebar
          isOpen={leftSidebar.isOpen}
          onClose={leftSidebar.toggle}
        />

        <div className="w-full h-full flex flex-col overflow-y-auto">    
          {props.children}
        </div>
      </div>
    </NextSessionContext.Provider>
  );
}