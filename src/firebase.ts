import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyCl2QYsTRjYhDVnqcC68Ta47EtEMignBR4",
  authDomain: "gen-lang-client-0055365528.firebaseapp.com",
  projectId: "gen-lang-client-0055365528",
  storageBucket: "gen-lang-client-0055365528.firebasestorage.app",
  messagingSenderId: "690280741567",
  appId: "1:690280741567:web:67626aa10cf1716670240a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-remixcrmhrmsport-740fecd5-a703-4725-b45e-e8751805a9b2");

let authInstance: any = null;
export function getAuthInstance() {
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}

export async function signInWithGoogle() {
  try {
    const auth = getAuthInstance();
    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function logOutFromFirebase() {
  try {
    const auth = getAuthInstance();
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out from Firebase:", error);
    throw error;
  }
}

/**
 * Generic function to fetch all documents from a Firestore collection.
 */
export async function dbGetCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const items: T[] = [];
    snapshot.forEach((doc) => {
      items.push({ ...doc.data() } as T);
    });
    return items;
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to save (insert or update) an item in a Firestore collection.
 */
export async function dbSaveItem(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Error saving item ${docId} to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to delete an item from a Firestore collection.
 */
export async function dbDeleteItem(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting item ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to bulk-save a collection of items (useful for seeding).
 */
export async function dbSaveCollection<T extends { id?: string; email?: string }>(
  collectionName: string, 
  items: T[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docId = item.id || item.email;
      if (!docId) return;
      const docRef = doc(db, collectionName, docId);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    console.error(`Error saving collection ${collectionName}:`, error);
    throw error;
  }
}
