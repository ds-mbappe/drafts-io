"use client"

import { useSidebar } from "@/components/editor/hooks/useSidebar";
import Sidebar from "@/components/pannels/Sidebar";
import { Alert } from "@/components/ui/Alert";
import NavbarApp from "@/components/ui/navbar";

export default function AppLayout(props: { children: React.ReactNode }) {
  const leftSidebar = useSidebar();

  return (
    <main className="min-h-screen bg-content1">
      <div className="w-full flex flex-col">
        <Alert />

        <NavbarApp
          isSidebarOpen={leftSidebar.isOpen}
          toggleSidebar={leftSidebar.toggle}
        />

        <div className="w-full h-full flex">
          {/* <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} /> */}
          {props.children}
        </div>
      </div>
    </main>
  );
}