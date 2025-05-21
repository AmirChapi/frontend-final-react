import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  setDoc
} from "firebase/firestore";
import { firestore } from "./config";

export async function addTask(task) {
  const taskRef = doc(firestore, "tasks", task.taskCode); // set with taskCode as ID
  return setDoc(taskRef, task);
}

export async function listTasks() {
  const snapshot = await getDocs(collection(firestore, "tasks"));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

export async function getTask(taskCode) {
  const taskDocRef = doc(firestore, "tasks", taskCode);
  const taskDocSnap = await getDoc(taskDocRef);

  if (taskDocSnap.exists()) {
    return { ...taskDocSnap.data(), id: taskDocSnap.id };
  } else {
    return null;
  }
}

export async function updateTask(task) {
  const { taskCode, ...taskData } = task;
  const taskRef = doc(firestore, "tasks", taskCode);
  return updateDoc(taskRef, taskData);
}

export async function deleteTask(taskCode) {
  const taskRef = doc(firestore, "tasks", taskCode);
  return deleteDoc(taskRef);
}
