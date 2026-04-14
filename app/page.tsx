"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getSystemMeta } from "@/lib/system";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let unsub = () => {};

    async function boot() {
      const system = await getSystemMeta();

      unsub = onAuthStateChanged(auth, (user) => {
        if (!system?.setupCompleted) {
          router.replace("/setup");
          return;
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        router.replace("/dashboard");
      });
    }

    boot();

    return () => unsub();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-zinc-500">Yönlendiriliyor...</p>
    </main>
  );
}
