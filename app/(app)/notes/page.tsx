"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdBy: string;
  isArchived?: boolean;
};

export default function NotesPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        setMessage("");

        if (!user) {
          setAllNotes([]);
          setMessage("Giriş yok");
          return;
        }

        const q = query(
          collection(db, "notes"),
          where("createdBy", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];

        setAllNotes(data);
      } catch (err) {
        console.error(err);
        setMessage("Notlar yüklenemedi");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // 🔥 aktif notlar
  const notes = useMemo(() => {
    return allNotes
      .filter((n) => !n.isArchived) // fallback
      .filter((n) => {
        const text = (n.title + " " + n.content).toLowerCase();
        return text.includes(search.toLowerCase());
      })
      .filter((n) => {
        if (category === "all") return true;
        return n.category === category;
      });
  }, [allNotes, search, category]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Notlar</h1>
          <p className="text-sm text-zinc-500">
            Aktif notların burada listelenir.
          </p>
        </div>

        <Link href="/notes/new" className="app-button app-button-primary">
          Yeni Not
        </Link>
      </div>

      {/* FILTER */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="app-input"
          placeholder="Ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="app-input max-w-[200px]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Tümü</option>
          <option value="general">Genel</option>
          <option value="idea">Fikir</option>
          <option value="process">Süreç</option>
          <option value="learning">Öğrenme</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="app-card p-5">Yükleniyor...</div>
      ) : message ? (
        <div className="app-card p-5">{message}</div>
      ) : notes.length === 0 ? (
        <div className="app-card p-5">Henüz aktif not yok.</div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="app-card rounded-2xl p-5"
            >
              <h2 className="text-lg font-semibold">{note.title}</h2>

              <p className="mt-2 text-sm text-zinc-500 line-clamp-3">
                {note.content}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {note.tags?.map((t) => (
                  <span key={t} className="text-xs border px-2 py-1 rounded">
                    #{t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
