import React, { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // COURSES
    let coursesList = JSON.parse(localStorage.getItem("coursesList"));
    if (!coursesList) {
      coursesList = Array.from({ length: 10 }, (_, i) => ({
        courseCode: `${100 + i}`,
        courseName: ['React', 'Angular', 'Vue'][i % 3],
        lecturer: `Dr. Lecturer ${i + 1}`,
        year: `20${22 + (i % 3)}`,
        semester: ['A', 'B', 'C'][i % 3],
      }));
      localStorage.setItem("coursesList", JSON.stringify(coursesList));
    }

    // STUDENTS
    let students = JSON.parse(localStorage.getItem("students"));
    if (!students) {
      students = Array.from({ length: 10 }, (_, i) => ({
        studentId: `12345678${i}`,
        fullName: `Student ${i + 1}`,
        age: `${18 + i}`,
        gender: ["Female", "Male", "Other"][i % 3],
        year: `20${20 + (i % 5)}`,
      }));
      localStorage.setItem("students", JSON.stringify(students));
    }

    // TASKS
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    if (!tasks) {
      tasks = Array.from({ length: 10 }, (_, i) => ({
        taskCode: Math.floor(Math.random() * 900 + 100),
        courseCode: coursesList[i % coursesList.length].courseCode, // קישור לקורס
        taskName: `Task ${i + 1}`,
        submissionDate: "2025-06-01",
        taskDescription: `Description for Task ${i + 1}`,
      }));
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // GRADES
    let grades = JSON.parse(localStorage.getItem("grades"));
    if (!grades) {
      grades = tasks.map((task, i) => ({
        idNumber: students[i]?.studentId || `30000${i}`, // ✅ לוקחים ID מהסטודנט התואם
        taskGrade: Math.floor(Math.random() * 41 + 60),
        taskName: task.taskName,
        taskCode: task.taskCode,
      }));
      localStorage.setItem("grades", JSON.stringify(grades));
    }

    // MESSAGES
    let messages = JSON.parse(localStorage.getItem("messages"));
    if (!messages) {
      messages = tasks.map((task, i) => ({
        messageCode: `M${i + 1}`,
        courseCode: task.courseCode,
        courseName: coursesList.find(c => c.courseCode === task.courseCode)?.courseName || '',
        assignmentCode: task.taskCode,
        assignmentName: task.taskName,
        messageContent: `Important message about ${task.taskName}`,
      }));
      localStorage.setItem("messages", JSON.stringify(messages));
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
