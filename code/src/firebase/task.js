import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "./config";

// 📥 הוספת מטלה חדשה עם מזהה אוטומטי
export async function addTask(task) {
  return addDoc(collection(firestore, "tasks"), task);
}

// 📄 קבלת כל המטלות
export async function listTasks() {
  const snapshot = await getDocs(collection(firestore, "tasks"));
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

// ✏️ עדכון מטלה לפי מזהה (id)
export async function updateTask(task) {
  const { id, ...data } = task;
  const taskRef = doc(firestore, "tasks", id);
  return updateDoc(taskRef, data);
}

// ❌ מחיקת מטלה לפי מזהה (id)
export async function deleteTask(taskId) {
  const taskRef = doc(firestore, "tasks", taskId);
  return deleteDoc(taskRef);
}

// 🔍 בדיקה אם קוד מטלה קיים (למניעת כפילויות)
export async function isTaskCodeExists(taskCode) {
  const snapshot = await getDocs(collection(firestore, "tasks"));
  return snapshot.docs.some((doc) => doc.data().taskCode === taskCode);
}
