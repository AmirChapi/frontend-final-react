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

// הוספת קורס עם מזהה courseCode
export async function addCourse(course) {
  const courseRef = doc(firestore, "courses", course);
  return setDoc(courseRef, course);
}

// קבלת רשימת קורסים
export async function listCourses() {
  const snapshot = await getDocs(collection(firestore, "courses"));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

// קבלת קורס לפי courseCode
export async function getCourse(courseCode) {
  const courseDocRef = doc(firestore, "courses", courseCode);
  const courseDocSnap = await getDoc(courseDocRef);

  if (courseDocSnap.exists()) {
    return { ...courseDocSnap.data(), id: courseDocSnap.id };
  } else {
    return null;
  }
}

// עדכון קורס לפי courseCode
export async function updateCourse(course) {
  const { courseCode, ...courseData } = course;
  const courseRef = doc(firestore, "courses", id);
  return updateDoc(courseRef, courseData);
}

// מחיקת קורס לפי courseCode
export async function deleteCourse(courseCode) {
  const courseRef = doc(firestore, "courses", courseCode);
  return deleteDoc(courseRef);
}
