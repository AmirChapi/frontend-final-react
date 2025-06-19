import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { firestore } from "./config";

export async function addCourse(course) {
  const docRef = doc(collection(firestore, "courses"));
  const newCourse = { ...course, courseCode: docRef.id };
  await setDoc(docRef, newCourse);
  return { id: docRef.id, ...newCourse };
}

export async function listCourses() {
  const snapshot = await getDocs(collection(firestore, "courses"));
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function updateCourse(course) {
  const { id, ...data } = course;
  const courseRef = doc(firestore, "courses", id);
  return updateDoc(courseRef, data);
}

export async function deleteCourse(courseId) {
  const courseRef = doc(firestore, "courses", courseId);
  await deleteDoc(courseRef);
}

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

export async function getCourseById(courseId) {
  const courseRef = doc(firestore, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  if (courseSnap.exists()) {
    return { ...courseSnap.data(), id: courseSnap.id };
  } else {
    return null;
  }
}