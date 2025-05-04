"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <header className="fixed inset-x-0 top-0 z-10 bg-white dark:bg-gray-900 shadow">
        <div className="flex items-center justify-between w-full px-4 py-3">
          {/* Logo + Title */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Voyage Vault Logo"
              className="w-10 h-10 md:w-12 md:h-12"
            />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              Voyage Vault
            </span>
          </div>

          {/* Desktop Logout */}
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="hidden md:inline-block px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Logout
            </button>
          ) : (
            <div className="hidden md:flex space-x-2">
              <a
                href="/auth/signin"
                className="hidden md:inline-block px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded mr-2"
              >
                Sign In
              </a>
              <a
                href="/auth/signup"
                className="hidden md:inline-block px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Sign Up
              </a>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-2 text-gray-900 dark:text-gray-100"
          >
            {/* Simple “bars” icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Drawer */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-20 flex"
            onClick={() => setDrawerOpen(false)}
          >
            {/* backdrop */}
            <div className="absolute inset-0 bg-black opacity-30" />

            {/* drawer panel */}
            <nav
              className="relative ml-auto w-64 h-full bg-white dark:bg-gray-800 p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-gray-900 dark:text-gray-100"
                >
                  {/* X icon */}
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                </button>
                {session ? (
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <a
                      href="/auth/signin"
                      className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Sign In
                    </a>
                    <a
                      href="/auth/signup"
                      className="block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      Sign Up
                    </a>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

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
