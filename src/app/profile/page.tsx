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
      <main className="pt-20 min-h-screen bg-white dark:bg-gray-900 p-4">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Your Profile
          </h1>
          <ProfileForm />
        </div>
      </main>
    </>
  );
}