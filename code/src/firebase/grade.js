// src/firebase/grade.js
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from "firebase/firestore";
import { firestore } from "./config";

export async function addGrade(grade) {
  return addDoc(collection(firestore, "grades"), grade);
}

export async function listGrades() {
  const snapshot = await getDocs(collection(firestore, "grades"));
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function updateGrade(grade) {
  const { id, ...data } = grade;
  const gradeRef = doc(firestore, "grades", id);
  return updateDoc(gradeRef, data);
}

export async function deleteGrade(id) {
  const gradeRef = doc(firestore, "grades", id);
  return deleteDoc(gradeRef);
}

export async function getGrade(id) {
  const gradeRef = doc(firestore, "grades", id);
  const snap = await getDoc(gradeRef);
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
}
