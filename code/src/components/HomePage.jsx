import React, { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    console.log("HomePage loaded. Running initialization...");

    // TASKS
    if (!localStorage.getItem("tasks")) {
      const defaultTasks = Array.from({ length: 10 }, (_, i) => ({
        taskCode: Math.floor(Math.random() * 900 + 100),
        courseCode: `C${200 + i}`,
        taskName: `Task ${i + 1}`,
        submissionDate: "2025-06-01",
        taskDescription: `Description for Task ${i + 1}`,
      }));
      localStorage.setItem("tasks", JSON.stringify(defaultTasks));
    }

    // GRADES
    if (!localStorage.getItem("grades")) {
      const defaultGrades = Array.from({ length: 10 }, (_, i) => ({
        idNumber: `30000${i}`,
        taskGrade: Math.floor(Math.random() * 41 + 60),
        taskName: `Task ${i + 1}`,
      }));
      localStorage.setItem("grades", JSON.stringify(defaultGrades));
    }

    // MESSAGES
    if (!localStorage.getItem("messages")) {
      const defaultMessages = Array.from({ length: 10 }, (_, i) => ({
        messageCode: `M${i + 1}`,
        courseCode: `C${100 + i}`,
        courseName: `Course ${i + 1}`,
        assignmentCode: `A${100 + i}`,
        assignmentName: `Assignment ${i + 1}`,
        messageContent: `Important message about Assignment ${i + 1}`,
      }));
      localStorage.setItem("messages", JSON.stringify(defaultMessages));
    }

    // STUDENTS
    if (!localStorage.getItem("students")) {
      const defaultStudents = Array.from({ length: 10 }, (_, i) => ({
        studentId: `12345678${i}`,
        fullName: `Student ${i + 1}`,
        age: `${18 + i}`,
        gender: ["Female", "Male", "Other"][i % 3],
        year: `20${20 + (i % 5)}`,
      }));
      localStorage.setItem("students", JSON.stringify(defaultStudents));
    }

    // COURSES
    if (!localStorage.getItem("coursesList")) {
      const defaultCourses = Array.from({ length: 10 }, (_, i) => ({
        id: `C${100 + i}`,
        name: `Course ${i + 1}`,
        lecturer: `Dr. Lecturer ${i + 1}`,
        year: `20${22 + (i % 3)}`,
        semester: ['A', 'B', 'C'][i % 3],
      }));
      localStorage.setItem("coursesList", JSON.stringify(defaultCourses));
    }

    console.log("Default data loaded to Local Storage.");
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to the System</h1>
      <p>Initial data for tasks, grades, students, messages, and courses has been loaded.</p>
    </div>
  );
}
