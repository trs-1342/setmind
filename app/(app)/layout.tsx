"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getSystemMeta } from "@/lib/system";
import AppSidebar from "@/components/app-sidebar";
import ThemeToggle from "@/components/theme-toggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const [workspaceTitle, setWorkspaceTitle] = useState("SetMind");

  useEffect(() => {
    let unsub = () => {};

    async function boot() {
      const system = await getSystemMeta();

      if (!system?.setupCompleted) {
        router.replace("/setup");
        return;
      }

      if (system.workspaceName) {
        setWorkspaceTitle(`${system.workspaceName} SetMind`);
      }

      unsub = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        setBooting(false);
      });
    }

    boot();

    return () => unsub();
  }, [router]);

  if (booting) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Yükleniyor...</p>
      </main>
    );
  }

  return (
    <div className="app-shell flex min-h-screen">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/75 backdrop-blur-xl dark:bg-zinc-950/70">
          <div className="mobile-safe flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex rounded-2xl border p-2.5 hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
              >
                <Menu size={18} />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold sm:text-lg">
                  {workspaceTitle}
                </h1>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </header>

        <main className="mobile-safe flex-1 px-4 py-4 sm:px-6 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
