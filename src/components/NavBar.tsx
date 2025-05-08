"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <header className="fixed inset-x-0 top-0 z-10 bg-white dark:bg-gray-900 shadow">
        <div className="flex items-center justify-between w-full px-4 py-3">
          {/* Logo + Title + Nav Links */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Voyage Vault Logo"
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                Voyage Vault
              </span>
            </Link>
            <nav className="hidden md:flex ml-8 space-x-4">
              <Link
                href="/trips"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Trips
              </Link>
              <Link
                href="/profile"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Profile
              </Link>
              <Link
                href="/ai"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                AI Companion
              </Link>
            </nav>
          </div>

          {/* Desktop Auth Buttons */}
          {session ? (
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Logged in as <span className="font-bold">{session.user.email}</span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex space-x-2">
              <Link
                href="/auth/signin"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-2 text-gray-900 dark:text-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
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
            <div className="absolute inset-0 bg-black opacity-30" />
            <nav
              className="relative ml-auto w-64 h-full bg-white dark:bg-gray-800 p-4 shadow-lg flex flex-col"
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
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
                    <Link
                      href="/auth/signin"
                      className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/trips"
                    className="block px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Trips
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="block px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai"
                    className="block px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    AI Companion
                  </Link>
                </li>
              </ul>
              {session && (
                <p className="mt-auto pt-4 text-sm text-gray-700 dark:text-gray-300">
                  Logged in as <span className="font-bold">{session.user.email}</span>
                </p>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
