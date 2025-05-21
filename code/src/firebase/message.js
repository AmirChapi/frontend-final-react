import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "./config";

// ✅ הוספת הודעה עם מזהה אוטומטי
export async function addMessage(message) {
  return addDoc(collection(firestore, "messages"), message);
}

// ✅ קבלת כל ההודעות
export async function listMessages() {
  const snapshot = await getDocs(collection(firestore, "messages"));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

// ✅ קבלת הודעה לפי מזהה (id)
export async function getMessage(id) {
  const messageRef = doc(firestore, "messages", id);
  const messageSnap = await getDoc(messageRef);
  return messageSnap.exists() ? { ...messageSnap.data(), id: messageSnap.id } : null;
}

// ✅ עדכון הודעה לפי id
export async function updateMessage(message) {
  const { id, ...messageData } = message;
  return updateDoc(doc(firestore, "messages", id), messageData);
}

// ✅ מחיקת הודעה לפי id
export async function deleteMessage(id) {
  return deleteDoc(doc(firestore, "messages", id));
}
