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

export async function addTask(task) {
  return addDoc(collection(firestore, "tasks"), task);
}

export async function listTasks() {
  const snapshot = await getDocs(collection(firestore, "tasks"));
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function updateTask(task) {
  const { id, ...data } = task;
  const taskRef = doc(firestore, "tasks", id);
  return updateDoc(taskRef, data);
}

export async function deleteTask(taskId) {
  const taskRef = doc(firestore, "tasks", taskId);
  return deleteDoc(taskRef);
}

export async function isTaskCodeExists(taskCode, excludeId = null) {
  const snapshot = await getDocs(collection(firestore, "tasks"));
  return snapshot.docs.some((doc) => {
    const data = doc.data();
    return data.taskCode === taskCode && doc.id !== excludeId;
  });
}

export async function getTaskById(taskId) {
  const taskRef = doc(firestore, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists()) {
    return { ...taskSnap.data(), id: taskSnap.id };
  } else {
    return null;
  }
}
