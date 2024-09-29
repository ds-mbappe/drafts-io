"use client"

import { useSidebar } from "@/components/editor/hooks/useSidebar";
import Sidebar from "@/components/pannels/Sidebar";
import { Alert } from "@/components/ui/Alert";
import NavbarApp from "@/components/ui/navbar";

export default function AppLayout(props: { children: React.ReactNode }) {
  const leftSidebar = useSidebar();

  return (
    <main className="w-full bg-content1 flex flex-col overflow-hidden">
      <Alert />

      {/* <NavbarApp
        isSidebarOpen={leftSidebar.isOpen}
        toggleSidebar={leftSidebar.toggle}
      /> */}

      {props.children}
    </main>
  );
}