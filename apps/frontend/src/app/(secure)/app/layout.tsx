"use client"

import { useEffect, useState } from "react";
import { getSession, signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { NextSessionContext } from "@/contexts/SessionContext";
import NavbarApp from "@/components/ui/NavbarApp";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { isTokenExpired, refreshAccessToken } from "@/lib/utils";

export default function AppLayout(props: { children: React.ReactNode }) {
  const { update } = useSession();
  const [session, setSession] = useState<Session | null>();
  const contextValue = { session, setSession }

  useEffect(() => {
    const fetchSession = async () => {
      const response = await getSession();
      setSession(response);
    };

    fetchSession();

    const interval = setInterval(async () => {
      const currentSession = await getSession();
      const token = currentSession?.accessToken;
      const refreshToken = currentSession?.user?.refreshToken;

      if (token && isTokenExpired(token) && refreshToken) {
        try {
          const data = await refreshAccessToken(refreshToken);

          await update({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: currentSession.user,
          });
        } catch (err) {
          console.error("Token refresh failed", err);
          await signOut({ callbackUrl: "/account/sign-in" });
        }
      }
    }, 12 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NextSessionContext.Provider value={contextValue}>
      <div className="w-full min-h-dvh flex flex-col flex-1 relative bg-content1">
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