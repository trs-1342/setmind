"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getSystemMeta } from "@/lib/system";
import { login } from "@/lib/auth";
import ThemeToggle from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [workspaceName, setWorkspaceName] = useState("SetMind");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let unsub = () => {};

    async function boot() {
      const system = await getSystemMeta();

      if (!system?.setupCompleted) {
        router.replace("/setup");
        return;
      }

      if (system.workspaceName) {
        setWorkspaceName(`${system.workspaceName} SetMind`);
      }

      unsub = onAuthStateChanged(auth, (user) => {
        if (user) {
          router.replace("/dashboard");
          return;
        }

        setBooting(false);
      });
    }

    boot();

    return () => unsub();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      await login(email, password);
      router.replace("/dashboard");
    } catch (error) {
      console.error(error);
      setMessage("Giriş başarısız");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Kontrol ediliyor...</p>
      </main>
    );
  }

  return (
    <main className="mobile-safe flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="surface w-full max-w-md rounded-[28px] p-5 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {workspaceName}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Hesabınla giriş yap
            </p>
          </div>

          <ThemeToggle />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="app-input"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="app-input"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="app-button app-button-primary w-full"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          <div className="flex items-center justify-between gap-3 text-sm">
            <Link
              href="/forgot-password"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              Şifremi unuttum
            </Link>
          </div>

          {message ? <p className="text-sm text-red-500">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
