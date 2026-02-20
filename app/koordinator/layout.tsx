import KoordinatorSidebar from "./KoordinatorSidebar";

export default function KoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <KoordinatorSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
