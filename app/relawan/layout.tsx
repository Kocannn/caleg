import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RelawanSidebar from "./RelawanSidebar";

export default async function RelawanLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "RELAWAN") redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RelawanSidebar userName={session.user.name} />
      <main className="flex-1 ml-64 p-6 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
