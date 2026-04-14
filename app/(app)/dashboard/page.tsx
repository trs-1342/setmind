"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSystemMeta } from "@/lib/system";

export default function DashboardPage() {
  const [title, setTitle] = useState("çalışma alanını tek yerden yönet");

  const stats = [
    { label: "Toplam Not", value: 0 },
    { label: "Zihin Haritası", value: 0 },
    { label: "Süreç", value: 0 },
    { label: "Kişi", value: 0 },
  ];

  useEffect(() => {
    async function load() {
      const system = await getSystemMeta();
      if (!system) return;

      const map: Record<string, string> = {
        business: "iş akışını",
        learning: "öğrenme sürecini",
        personal: "hayatını",
        system: "sistemlerini",
      };

      const typeText = map[system.workspaceType || "system"];
      setTitle(`${typeText}, notlarını ve bağlantılarını tek yerden yönet`);
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="app-card rounded-3xl p-6">
        <p className="text-sm text-zinc-500">Hoş geldin</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="app-card rounded-3xl p-5">
            <p className="text-sm text-zinc-500">{item.label}</p>
            <h3 className="mt-3 text-2xl font-semibold">{item.value}</h3>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="app-card rounded-3xl p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Hızlı Başlangıç</h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/notes/new" className="app-button app-button-primary">
              Yeni Not
            </Link>

            <button className="app-button app-button-secondary" type="button">
              Yeni Zihin Haritası
            </button>

            <button className="app-button app-button-secondary" type="button">
              Kişi Ekle
            </button>

            <button className="app-button app-button-secondary" type="button">
              Süreç Ekle
            </button>
          </div>
        </div>

        <div className="app-card rounded-3xl p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Bugün</h3>

          <div className="mt-4 space-y-3">
            <div className="soft-muted rounded-2xl p-4 text-sm">
              Son notlarını burada göreceksin.
            </div>
            <div className="soft-muted rounded-2xl p-4 text-sm">
              Hızlı başlangıçtan yeni kayıt açabilirsin.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
