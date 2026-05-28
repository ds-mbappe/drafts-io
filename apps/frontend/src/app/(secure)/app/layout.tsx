"use client"

import { useEffect, useMemo, useState } from "react";
import { getSession, signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { NextSessionContext } from "@/contexts/SessionContext";
import NavbarApp from "@/components/ui/navbar/NavbarApp";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { AiChatPanel } from "@/components/chat/AiChatPanel";
import Sidebar from "@/components/pannels/Sidebar";
import ModalDraftDetails from "@/components/pannels/ModalDraftDetails";
import { isTokenExpired, refreshAccessToken } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { TranslationsProvider } from "@/providers/TranslationsProvider";

export default function AppLayout(props: { children: React.ReactNode }) {
  const { update } = useSession();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>();
  const contextValue = useMemo(() => ({ session, setSession }), [session]);

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

          const updatedSession = await update({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: currentSession.user,
          });
          setSession(updatedSession);
        } catch (err) {
          console.error("Token refresh failed", err);

          await signOut({ callbackUrl: "/account/sign-in" });
        }
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NextSessionContext.Provider value={contextValue}>
      <TranslationsProvider>
      <div className="flex h-dvh w-full bg-content1">
        {/* Sidebar: 0px in flow when hidden/floating, 260px when docked */}
        <Sidebar />

        {/* Right column: always flex-1, navbar shrinks when sidebar docks */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <NavbarApp user={session?.user as any} />

          <div id="main_container" className="flex-1 overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto flex flex-col">
              {props.children}
            </div>

            <ScrollToTop />
          </div>
        </div>

        {pathname !== '/app/settings' && pathname !== '/app/notifications' && <AiChatPanel />}
        <ModalDraftDetails />
      </div>
      </TranslationsProvider>
    </NextSessionContext.Provider>
  );
}
