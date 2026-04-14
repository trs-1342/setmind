"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getSystemMeta } from "@/lib/system";
import { createOwnerUser } from "@/lib/auth";
import ThemeToggle from "@/components/theme-toggle";

export default function SetupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceType, setWorkspaceType] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let unsub = () => {};

    async function checkSetup() {
      const system = await getSystemMeta();

      unsub = onAuthStateChanged(auth, (user) => {
        if (system?.setupCompleted) {
          router.replace(user ? "/dashboard" : "/login");
          return;
        }

        setBooting(false);
      });
    }

    checkSetup();

    return () => unsub();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (name.trim().length < 3) {
      setMessage("Ad soyad geçerli değil");
      return;
    }

    if (workspaceName.trim().length < 2) {
      setMessage("Sistem adı geçerli değil");
      return;
    }

    if (!workspaceType) {
      setMessage("Tür seçmelisin");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setMessage("E-posta ve şifre zorunlu");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      await createOwnerUser(name, email, password, workspaceName, workspaceType);

      router.replace("/dashboard");
    } catch (error) {
      console.error(error);

      if (error instanceof Error && error.message === "SETUP_ALREADY_COMPLETED") {
        setMessage("Kurulum zaten tamamlanmış");
      } else {
        setMessage("Kurulum başarısız");
      }
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
            <h1 className="text-2xl font-semibold">İlk Kurulum</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Workspace adını belirle ve owner hesabını oluştur
            </p>
          </div>

          <ThemeToggle />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="app-input"
            placeholder="Ad Soyad"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="app-input"
            placeholder="Workspace adı (ör: Ekokimya)"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />

          <select
            className="app-input"
            value={workspaceType}
            onChange={(e) => setWorkspaceType(e.target.value)}
          >
            <option value="">Tür seç</option>
            <option value="business">İş</option>
            <option value="learning">Öğrenme</option>
            <option value="personal">Kişisel</option>
            <option value="system">Sistem / Teknik</option>
          </select>

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
            {loading ? "Kuruluyor..." : "Kurulumu Tamamla"}
          </button>

          {message ? <p className="text-sm text-red-500">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
