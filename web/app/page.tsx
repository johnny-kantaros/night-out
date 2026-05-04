"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) router.replace(token ? "/places" : "/login");
  }, [token, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center text-gray-400">
      Loading…
    </div>
  );
}
