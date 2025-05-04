"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/");
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
          Sign In
        </h1>
        {error && (
          <div className="mb-2 text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="text-blue-600 underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
