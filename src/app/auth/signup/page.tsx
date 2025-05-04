"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push("/auth/signin");
    } else {
      const data = await res.json();
      setError(data.error || "Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 bg-white dark:bg-gray-900">
      {/* Logo */}
      <div className="mb-6 md:mb-0 md:mr-8 flex-shrink-0">
        <img
          src="/logo.png"
          alt="Voyage Vault Logo"
          className="w-48 h-48 md:w-64 md:h-64"
        />
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">
          Create an account
        </h1>
        {error && (
          <div className="mb-2 text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-green-600 underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
