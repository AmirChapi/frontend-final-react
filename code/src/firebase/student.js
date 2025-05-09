import { addDoc, collection } from "firebase/firestore";
import { Firestore } from "firebase/firestore";
export async function addStudent(student) {
    return addDoc(collection(firestore, "students") , student);
}