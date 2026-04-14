"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function NewNotePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Başlık zorunlu");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const user = auth.currentUser;

      if (!user) {
        setMessage("Giriş yok");
        return;
      }

      await addDoc(collection(db, "notes"), {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/notes");
    } catch (err) {
      console.error(err);
      setMessage("Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Yeni Not</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="app-input"
          placeholder="Başlık"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="app-input min-h-40"
          placeholder="İçerik"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <select
          className="app-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="general">Genel</option>
          <option value="idea">Fikir</option>
          <option value="process">Süreç</option>
          <option value="learning">Öğrenme</option>
        </select>

        <input
          className="app-input"
          placeholder="etiketler (virgül ile)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <button className="app-button app-button-primary w-full">
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>

        {message && <p className="text-red-500 text-sm">{message}</p>}
      </form>
    </div>
  );
}
