"use client"

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import { NextSessionContext } from "@/contexts/SessionContext";
import NavbarApp from "@/components/ui/navbar";
import ScrollToTop from "@/components/ui/ScrollToTop";

export default function AppLayout(props: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>();
  const contextValue = { session, setSession }

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
      <div className="w-full min-h-[100dvh] flex flex-col flex-1 relative bg-content1">
        <NavbarApp user={session?.user} />

        <div id="main_container" className="w-full h-[calc(100dvh-65px)] overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto flex flex-col">
            {props.children}
          </div>

          <ScrollToTop />
        </div>
      </div>
    </NextSessionContext.Provider>
  );
}