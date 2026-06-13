import Sidebar from "@/components/Sidebar";
import CommandMenu from "@/components/CommandMenu";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-10">
        {children}
      </main>
      <CommandMenu />
    </div>
  );
}
