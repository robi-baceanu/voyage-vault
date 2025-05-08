// src/app/page.tsx
"use client";

import { useSession } from "next-auth/react";
import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [userName, setUserName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(false);

  // Whenever we're authenticated, fetch the name
  useEffect(() => {
    if (status === "authenticated") {
      setLoadingName(true);
      fetch("/api/profile")
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch profile");
          const data = await res.json();
          setUserName(data.name);
        })
        .catch(() => {
          setUserName(null);
        })
        .finally(() => {
          setLoadingName(false);
        });
    }
  }, [status]);

  return (
    <>
      <NavBar />

      <main className="pt-20 flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        {status === "loading" ? (
          <p className="text-gray-900 dark:text-gray-100">Loading…</p>
        ) : session ? (
          loadingName ? (
            <p className="text-gray-900 dark:text-gray-100">Loading…</p>
          ) : userName ? (
            <p className="mt-4 text-lg">Welcome, {userName}!</p>
          ) : (
            <p className="mt-4 text-lg">Welcome!</p>
          )
        ) : (
          <p className="text-gray-900 dark:text-gray-100 text-lg">
            No user is logged in.
          </p>
        )}
      </main>
    </>
  );
}
