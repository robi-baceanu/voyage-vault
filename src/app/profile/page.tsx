import NavBar from "@/components/NavBar";
import ProfileForm from "@/components/ProfileForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile – Voyage Vault",
};

export default async function ProfilePage() {
  // Protect route
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // Not logged in → send to sign-in
    redirect("/auth/signin");
  }

  // Render Profile page
  return (
    <>
      <NavBar />
      <main className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account settings and personal information
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-8">
              <ProfileForm />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">Contact support</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}