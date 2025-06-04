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

// הוספת סטודנט חדש עם מזהה אוטומטי
export async function addStudent(student) {
  return addDoc(collection(firestore, "students"), student);
}

// קבלת רשימת כל הסטודנטים
export async function listStudent() {
  const snapshot = await getDocs(collection(firestore, "students"));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

// קבלת סטודנט לפי מזהה מ־Firestore
export async function getStudent(studentId) {
  const studentDocRef = doc(firestore, "students", studentId);
  const studentDocSnap = await getDoc(studentDocRef);

  if (studentDocSnap.exists()) {
    return { ...studentDocSnap.data(), id: studentDocSnap.id };
  } else {
    return null;
  }
}

// עדכון סטודנט לפי מזהה
export async function updateStudent(student) {
  const { id, ...studentData } = student;
  const studentRef = doc(firestore, "students", id);
  return updateDoc(studentRef, studentData);
}

// מחיקת סטודנט לפי מזהה
export async function deleteStudent(studentId) {
  const studentRef = doc(firestore, "students", studentId);
  return deleteDoc(studentRef);
}