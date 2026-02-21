import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role) {
    const routes: Record<string, string> = {
      ADMIN: "/admin",
      CALEG: "/caleg",
      KOORDINATOR: "/koordinator",
      RELAWAN: "/relawan",
    };
    redirect(routes[session.user.role] || "/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sistem Manajemen Caleg</h1>
            <p className="text-gray-500 mt-1">Silakan login untuk melanjutkan</p>
          </div>
          <LoginForm />
        </div>
        <p className="text-center text-blue-200 text-sm mt-6">
          &copy; 2026 Sistem Manajemen Caleg. All rights reserved.
        </p>
      </div>
    </div>
  );
}
