import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CalegSidebar from "./CalegSidebar";

export default async function CalegLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "CALEG") redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CalegSidebar userName={session.user.name} />
      <main className="flex-1 ml-64 p-6 transition-all duration-300">{children}</main>
    </div>
  );
}
