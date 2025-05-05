"use client";

import { useSession } from "next-auth/react";
import NavBar from "@/components/NavBar";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <>
      {/* Top Bar */}
      <NavBar />

      {/* Main Content */}
      <main className="pt-20 flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        {status === "loading" ? (
          <p className="text-gray-900 dark:text-gray-100">Loading…</p>
        ) : session ? (
          <p className="text-gray-900 dark:text-gray-100 text-lg">
            Welcome, <strong>{session.user?.email}</strong>
          </p>
        ) : (
          <p className="text-gray-900 dark:text-gray-100 text-lg">
            No user is logged in
          </p>
        )}
      </main>
    </>
  );
}
