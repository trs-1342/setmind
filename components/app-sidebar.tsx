"use client";

import Link from "next/link";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitBranch,
  LayoutDashboard,
  Users,
  Workflow,
  X,
} from "lucide-react";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes", label: "Notlar", icon: FileText },
  { href: "/archives", label: "Arşivler", icon: Archive },
  { href: "#", label: "Zihin Haritaları", icon: GitBranch },
  { href: "#", label: "Kişiler", icon: Users },
  { href: "#", label: "Süreçler", icon: Workflow },
];

export default function AppSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: Props) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="sidebar overlay"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen border-r transition-all duration-300",
          "lg:static lg:z-auto",
          "bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-[var(--border)] backdrop-blur-xl",
          collapsed ? "lg:w-24" : "lg:w-72",
          mobileOpen
            ? "translate-x-0 w-[86vw] max-w-80"
            : "-translate-x-full w-[86vw] max-w-80",
          "lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className={`${collapsed ? "lg:hidden" : "block"}`}>
            <div className="text-base font-semibold tracking-tight">SetMind</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Internal SaaS Workspace
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden rounded-xl border p-2 hover:bg-black/5 dark:hover:bg-white/5 lg:inline-flex"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <button
              type="button"
              onClick={onCloseMobile}
              className="inline-flex rounded-xl border p-2 hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-zinc-700 transition hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/5"
              >
                <Icon size={18} />
                <span className={`${collapsed ? "lg:hidden" : "block"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
