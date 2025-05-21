import { addDoc, collection, getDocs,updateDoc, doc, getDoc, deleteDoc} from "firebase/firestore";
import {firestore} from "./config";
export async function addStudent(student) {
    return addDoc(collection(firestore, "students") , student);
}

export async function listStudent() {
    const snapshot = await getDocs(collection(firestore, "students"));
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
}


export async function getStudent(studentId) {
  const studentDocRef = doc(firestore, "students", studentId);
  const studentDocSnap = await getDoc(studentDocRef);

  if (studentDocSnap.exists()) {
    return { ...studentDocSnap.data(), id: studentDocSnap.id };
  } else {
    return null;
  }
}
export async function updateStudent(student){
  const { id, ...studentData } = student; 
  const studentRef = doc(firestore, "students", id);
  return updateDoc(studentRef, studentData);
}
export async function deleteStudent(studentId) {
  const studentRef = doc(firestore, "students", studentId);
  return deleteDoc(studentRef);
} 



