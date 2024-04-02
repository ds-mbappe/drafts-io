import Sidebar from "@/components/ui/sidebar";

export default function AppLayout(props: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <div className="w-full flex">
        {/* <Sidebar /> */}
        {props.children}
      </div>
    </main>
  );
}