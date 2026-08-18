import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use custom firestore database if provided in config, otherwise default
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Helper to convert any username (Arabic, English, alphanumeric) or email into a valid email format for Firebase Auth
export function stringToHex(str: string): string {
  try {
    return Array.from(new TextEncoder().encode(str))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return encodeURIComponent(str).replace(/%/g, '').toLowerCase();
  }
}

export function cleanUsernameKey(rawUsername: string): string {
  const trimmed = rawUsername.trim().toLowerCase();
  if (/^[a-z0-9_.-]+$/.test(trimmed) && trimmed.length >= 2) {
    return trimmed;
  }
  return `u_${stringToHex(trimmed)}`;
}

export function usernameToEmail(usernameOrEmail: string): string {
  const trimmed = usernameOrEmail.trim().toLowerCase();
  if (!trimmed) {
    return 'player_guest@tradeempire.online';
  }

  // If it's already a full standard email with domain
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return trimmed;
  }

  // If it's pure standard alphanumeric username
  if (/^[a-z0-9_.-]+$/.test(trimmed) && trimmed.length >= 2 && !trimmed.startsWith('.') && !trimmed.endsWith('.')) {
    return `${trimmed}@tradeempire.online`;
  }

  // For Arabic, Unicode, spaces, or special characters: encode safely to hex
  const hex = stringToHex(trimmed);
  return `u_${hex}@tradeempire.online`;
}

export function emailToUsername(email: string): string {
  if (!email) return 'Trader';
  return email.split('@')[0];
}

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
};
export type { User };
