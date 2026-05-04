"use client";

import { useAuth } from "@/lib/auth-context";
import { APIError } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", display_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.display_name);
      router.replace("/places");
    } catch (err) {
      setError(err instanceof APIError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight">Night Out</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-semibold">Create account</h2>
          {(
            [
              { label: "Display name", key: "display_name", type: "text", autoComplete: "name" },
              { label: "Username", key: "username", type: "text", autoComplete: "username" },
              { label: "Email", key: "email", type: "email", autoComplete: "email" },
              { label: "Password", key: "password", type: "password", autoComplete: "new-password" },
            ] as const
          ).map(({ label, key, type, autoComplete }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium">{label}</label>
              <input
                type={type}
                autoComplete={autoComplete}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={form[key]}
                onChange={set(key)}
                required
              />
            </div>
          ))}
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
