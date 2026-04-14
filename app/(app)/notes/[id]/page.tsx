"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Note = {
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdBy: string;
  isArchived: boolean;
};

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.replace("/login");
          return;
        }

        const ref = doc(db, "notes", noteId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setMessage("Not bulunamadı");
          return;
        }

        const data = snap.data() as Note;

        if (data.createdBy !== user.uid) {
          setMessage("Bu nota erişim iznin yok");
          return;
        }

        setTitle(data.title || "");
        setContent(data.content || "");
        setCategory(data.category || "general");
        setTags((data.tags || []).join(", "));
        setIsArchived(Boolean(data.isArchived));
      } catch (error) {
        console.error(error);
        setMessage("Not yüklenemedi");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [noteId, router]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Başlık zorunlu");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await updateDoc(doc(db, "notes", noteId), {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        updatedAt: serverTimestamp(),
      });

      setMessage("Not güncellendi");
    } catch (error) {
      console.error(error);
      setMessage("Güncelleme başarısız");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveToggle() {
    try {
      setSaving(true);
      setMessage("");

      await updateDoc(doc(db, "notes", noteId), {
        isArchived: !isArchived,
        updatedAt: serverTimestamp(),
      });

      const nextArchived = !isArchived;
      setIsArchived(nextArchived);
      setMessage(nextArchived ? "Not arşivlendi" : "Not arşivden çıkarıldı");
    } catch (error) {
      console.error(error);
      setMessage("Arşiv işlemi başarısız");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Bu not silinsin mi?");
    if (!confirmed) return;

    try {
      setSaving(true);
      setMessage("");

      await deleteDoc(doc(db, "notes", noteId));
      router.replace(isArchived ? "/archives" : "/notes");
    } catch (error) {
      console.error(error);
      setMessage("Silme işlemi başarısız");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="app-card rounded-2xl p-5">
        <p className="text-sm text-zinc-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Not Detayı</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Düzenle, arşivle veya sil.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleArchiveToggle}
            disabled={saving}
            className="app-button app-button-secondary"
          >
            {isArchived ? "Arşivden Çıkar" : "Arşivle"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="app-button rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-medium text-red-500"
          >
            Sil
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <input
          className="app-input"
          placeholder="Başlık"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="app-input min-h-56"
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
          placeholder="Etiketler (virgül ile)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <button
          type="submit"
          disabled={saving}
          className="app-button app-button-primary w-full"
        >
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>

        {message ? <p className="text-sm text-zinc-500">{message}</p> : null}
      </form>
    </div>
  );
}
