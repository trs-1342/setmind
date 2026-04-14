"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSystemMeta } from "@/lib/system";
import { resetPassword } from "@/lib/auth";
import ThemeToggle from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("SetMind");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function boot() {
      const system = await getSystemMeta();

      if (!system?.setupCompleted) {
        router.replace("/setup");
        return;
      }

      if (system.workspaceName) {
        setWorkspaceName(`${system.workspaceName} SetMind`);
      }

      setBooting(false);
    }

    boot();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      await resetPassword(email);
      setMessage("Şifre sıfırlama e-postası gönderildi");
    } catch (error) {
      console.error(error);
      setMessage("İşlem başarısız");
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
              Şifre sıfırlama
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

          <button
            type="submit"
            disabled={loading}
            className="app-button app-button-primary w-full"
          >
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>

          {message ? <p className="text-sm">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
