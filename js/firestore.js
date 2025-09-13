// firestore.js

import { db, auth, showMessage } from "./appConfig.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// 🔹 Helper: Retry logic for transient network errors
async function withRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.message.includes("transport errored")) {
      console.warn(`Firestore transport error. Retrying... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay);
    } else {
      console.error("Firestore operation failed:", error);
      throw error;
    }
  }
}

// ✅ Save user data to Firestore
export async function saveUserData(uid, userData) {
  if (!uid) throw new Error("User UID is required!");

  const sanitizedData = {
    createdAt: serverTimestamp(),
    email: userData.email || "",
    name: userData.fullName || "",
    username: userData.username || "",
    phone: userData.phone || null,
    uid: uid
  };

  return withRetry(() => setDoc(doc(db, "users", uid), sanitizedData));
}

// ✅ Get user data from Firestore
export async function getUserData(uid) {
  return withRetry(async () => {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) return userSnap.data();
    console.warn("No such user:", uid);
    return null;
  });
}

// ✅ Update user data
export async function updateUserData(uid, updates) {
  return withRetry(() => updateDoc(doc(db, "users", uid), updates));
}

// ✅ Delete user data
export async function deleteUserData(uid) {
  return withRetry(() => deleteDoc(doc(db, "users", uid)));
}

// ✅ Add to any collection with auto-generated ID
export async function addToCollection(collectionName, data) {
  return withRetry(async () => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    console.log("Document added with ID:", docRef.id);
    return docRef.id;
  });
}

// ✅ Get all documents from a collection
export async function getCollectionData(collectionName) {
  return withRetry(async () => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const results = [];
    querySnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
    return results;
  });
}
