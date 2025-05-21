import { addDoc, collection, getDocs} from "firebase/firestore";
import {firestore} from "./config";
export async function addStudent(student) {
    return addDoc(collection(firestore, "students") , student);
}

export async function listStudent() {
    const snapshot = await getDocs(collection(firestore, "students"));
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
}


export async function getStudent(id) {
    const studentDocRef = doc(firestore, "students", id);
  const studentDocSnap = await getDoc(studentDocRef);
  return { ...studentDocSnap.data(), id: studentDocSnap.id };

}

export async function updateStudent(student) {
  const { studentId, ...studentData } = student;
  const studentRef = doc(firestore, "students", studentId);
  return updateDoc(studentRef, studentData);
}