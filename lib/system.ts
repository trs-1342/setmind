import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type SystemMeta = {
  workspaceName?: string;
  ownerId?: string;
  ownerEmail?: string;
  setupCompleted?: boolean;
  defaultTheme?: "light" | "dark" | "system";
};

export async function getSystemMeta(): Promise<SystemMeta | null> {
  const ref = doc(db, "appMeta", "system");
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data() as SystemMeta;
}
