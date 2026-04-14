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

export default function ArchivesPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const q = query(
        collection(db, "notes"),
        where("createdBy", "==", user.uid),
        orderBy("updatedAt", "desc")
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];

      setAllNotes(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const notes = useMemo(() => {
    return allNotes
      .filter((n) => n.isArchived) // arşiv
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
      <h1 className="text-2xl font-semibold">Arşivler</h1>

      <div className="flex gap-3">
        <input
          className="app-input"
          placeholder="Ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="app-input"
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

      {loading ? (
        <div>Yükleniyor...</div>
      ) : notes.length === 0 ? (
        <div className="app-card p-5">Arşiv boş</div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <div className="app-card p-5">
                <h2>{note.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
