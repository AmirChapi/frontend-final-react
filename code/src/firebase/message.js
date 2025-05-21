import {
  setDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { firestore } from "./config";

// הוספת הודעה עם מזהה messageCode
export async function addMessage(message) {
  const messageRef = doc(firestore, "messages", message.messageCode);
  return setDoc(messageRef, message);
}

// קבלת כל ההודעות
export async function listMessages() {
  const snapshot = await getDocs(collection(firestore, "messages"));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

// קבלת הודעה לפי messageCode
export async function getMessage(messageCode) {
  const messageDocRef = doc(firestore, "messages", messageCode);
  const messageDocSnap = await getDoc(messageDocRef);

  if (messageDocSnap.exists()) {
    return { ...messageDocSnap.data(), id: messageDocSnap.id };
  } else {
    return null;
  }
}

// עדכון הודעה לפי messageCode
export async function updateMessage(message) {
  const { messageCode, ...messageData } = message;
  const messageRef = doc(firestore, "messages", messageCode);
  return updateDoc(messageRef, messageData);
}

// מחיקת הודעה לפי messageCode
export async function deleteMessage(messageCode) {
  const messageRef = doc(firestore, "messages", messageCode);
  return deleteDoc(messageRef);
}
