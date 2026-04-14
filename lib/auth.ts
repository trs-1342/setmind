import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  return signOut(auth);
}

export async function createOwnerUser(
  name: string,
  email: string,
  password: string,
  workspaceName: string,
  workspaceType: string
) {
  const systemRef = doc(db, "appMeta", "system");
  const existingSystem = await getDoc(systemRef);

  if (existingSystem.exists()) {
    throw new Error("SETUP_ALREADY_COMPLETED");
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(cred.user, {
    displayName: name.trim(),
  });

  await setDoc(doc(db, "users", cred.user.uid), {
    name: name.trim(),
    email: email.trim(),
    role: "owner",
    themePreference: "system",
    workspaceName: workspaceName.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(systemRef, {
    workspaceName: workspaceName.trim(),
    workspaceType: workspaceType.trim(),
    ownerId: cred.user.uid,
    ownerEmail: email.trim(),
    setupCompleted: true,
    defaultTheme: "system",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return cred;
}
