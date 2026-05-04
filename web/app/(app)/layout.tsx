"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, loading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, token, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-400">Loading…</div>;
  }
  if (!token) return null;

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname.startsWith(href) ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-6">
          <Link href="/places" className="text-lg font-bold tracking-tight">Night Out</Link>
          <div className="flex gap-4">
            {navLink("/places", "My Places")}
            {navLink("/map", "Map")}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.display_name}</span>
            <button
              onClick={() => { logout(); router.replace("/login"); }}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
