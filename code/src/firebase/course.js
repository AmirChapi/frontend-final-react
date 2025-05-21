import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "./config";

// 📥 הוספת קורס חדש עם מזהה אוטומטי
export async function addCourse(course) {
  return addDoc(collection(firestore, "courses"), course);
}

// 📄 קבלת רשימת כל הקורסים
export async function listCourses() {
  const snapshot = await getDocs(collection(firestore, "courses"));
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

// ✏️ עדכון קורס לפי מזהה (id)
export async function updateCourse(course) {
  const { id, ...data } = course;
  const courseRef = doc(firestore, "courses", id);
  return updateDoc(courseRef, data);
}

// ❌ מחיקת קורס לפי מזהה (id)
export async function deleteCourse(courseId) {
  const courseRef = doc(firestore, "courses", courseId);
  return deleteDoc(courseRef);
}

// 🔍 בדיקה אם קוד קורס קיים (למניעת כפילויות)
export async function isCourseCodeExists(courseCode) {
  const snapshot = await getDocs(collection(firestore, "courses"));
  return snapshot.docs.some((doc) => doc.data().courseCode === courseCode);
}
