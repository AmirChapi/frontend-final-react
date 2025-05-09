import { addDoc, collection } from "firebase/firestore";
import {firestore} from "./config";
export async function addStudent(student) {
    return addDoc(collection(firestore, "students") , student);
}