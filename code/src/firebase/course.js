// firebase/course.js
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { firestore } from "./config";

// הוספת קורס - עם ID אוטומטי
export async function addCourse(course) {
  return addDoc(collection(firestore, "courses"), course);
}

// קבלת רשימת קורסים
export async function listCourses() {
  const snapshot = await getDocs(collection(firestore, "courses"));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

// קבלת קורס לפי courseCode
export async function getCourse(courseId) {
  const courseDocRef = doc(firestore, "courses", courseId);
  const courseDocSnap = await getDoc(courseDocRef);

  if (courseDocSnap.exists()) {
    return { ...courseDocSnap.data(), id: courseDocSnap.id };
  } else {
    return null;
  }
}

// עדכון קורס לפי id
export async function updateCourse(course) {
  const { id, ...courseData } = course;
  const courseRef = doc(firestore, "courses", id);
  return updateDoc(courseRef, courseData);
}

// מחיקת קורס לפי id
export async function deleteCourse(courseId) {
  const courseRef = doc(firestore, "courses", courseId);
  return deleteDoc(courseRef);
}
