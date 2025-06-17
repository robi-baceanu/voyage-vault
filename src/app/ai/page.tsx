import NavBar from "@/components/NavBar";
import AIChatClient from "@/components/AIChatClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AIPage() {
  // Protect route
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // Not logged in → send to sign-in
    redirect("/auth/signin");
  }

  // Render AI Chat page
  return (
    <>
      <NavBar />
      <main className="pt-20 p-4 bg-white dark:bg-gray-900 min-h-screen">
        <AIChatClient />
      </main>
    </>
  );
}
