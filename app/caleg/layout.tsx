import CalegSidebar from "./CalegSidebar";

export default function CalegLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <CalegSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
