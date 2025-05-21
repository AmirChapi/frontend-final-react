import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { firestore } from "./config";

export async function addGrade(grade) {
  return addDoc(collection(firestore, "grades"), grade);
}

export async function listGrades() {
  const snapshot = await getDocs(collection(firestore, "grades"));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

export async function getGrade(id) {
  const gradeDocRef = doc(firestore, "grades", id);
  const gradeDocSnap = await getDoc(gradeDocRef);

  if (gradeDocSnap.exists()) {
    return { ...gradeDocSnap.data(), id: gradeDocSnap.id };
  } else {
    return null;
  }
}

export async function updateGrade(grade) {
  const { id, ...gradeData } = grade;
  const gradeRef = doc(firestore, "grades", id);
  return updateDoc(gradeRef, gradeData);
}

export async function deleteGrade(id) {
  const gradeRef = doc(firestore, "grades", id);
  return deleteDoc(gradeRef);
}
