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

// ✅ מחיקת קורס לפי מזהה (id)
export async function deleteCourse(courseId) {
  const courseRef = doc(firestore, "courses", courseId);
  await deleteDoc(courseRef);
}

// ✅ בדיקה אם קוד קורס כבר קיים, תוך התחשבות במקרה של עריכה
export async function isCourseCodeExists(courseCode, excludeId = null) {
  const snapshot = await getDocs(collection(firestore, "courses"));
  return snapshot.docs.some((doc) => {
    const data = doc.data();
    return (
      data.courseCode === courseCode &&
      doc.id !== excludeId
    );
  });
}

// ✅ קבלת קורס בודד לפי מזהה (id)
export async function getCourseById(courseId) {
  const courseRef = doc(firestore, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  if (courseSnap.exists()) {
    return { ...courseSnap.data(), id: courseSnap.id };
  } else {
    return null;
  }
}
