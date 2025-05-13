import { addDoc, collection, getDocs} from "firebase/firestore";
import {firestore} from "./config";
export async function addStudent(student) {
    return addDoc(collection(firestore, "students") , student);
}

export async function listStudent() {
    const snapshot = await getDocs(collection(firestore, "students"));
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
}


