"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex rounded-2xl border p-2.5 hover:bg-black/5 dark:hover:bg-white/5"
      aria-label="Tema değiştir"
      title="Tema değiştir"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
