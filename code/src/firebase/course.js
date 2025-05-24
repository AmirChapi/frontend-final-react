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

// ✅ שינוי: מחיקת קורס לפי מזהה אמיתי (id) במקום courseCode
export async function deleteCourse(courseId) {
  const courseRef = doc(firestore, "courses", courseId);
  await deleteDoc(courseRef);
}

// ✅ שינוי: בדיקה אם קוד קורס קיים, תוך התחשבות במצב עריכה (excludeId)
export async function isCourseCodeExists(courseCode, excludeId = null) {
  const snapshot = await getDocs(collection(firestore, "courses"));
  return snapshot.docs.some((doc) => {
    const data = doc.data();
    return (
      data.courseCode === courseCode &&
      doc.id !== excludeId // מתעלמים מהקורס הנוכחי (בעת עריכה)
    );
  });
}
