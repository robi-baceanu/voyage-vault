"use client";

import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Voyage Vault</h1>

      {status === "loading" ? (
        <p>Loading session…</p>
      ) : session ? (
        <p className="text-lg">
          Logged in as <strong>{session.user?.email}</strong>
        </p>
      ) : (
        <p className="text-lg">No user is logged in</p>
      )}
    </div>
  );
}
