import { Alert } from "@/components/ui/Alert";

export default function AppLayout(props: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-content1 overflow-y-hidden">
      <div className="w-full flex">
        <Alert />
        {/* <Sidebar /> */}
        {props.children}
      </div>
    </main>
  );
}