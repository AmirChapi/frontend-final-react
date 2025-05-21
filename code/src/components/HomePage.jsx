// import React, { useEffect } from "react";

// export default function HomePage() {
//   useEffect(() => {
//     // COURSES
//     let coursesList = JSON.parse(localStorage.getItem("coursesList"));
//     if (!coursesList) {
//       coursesList = Array.from({ length: 10 }, (_, i) => ({
//         courseCode: `${100 + i}`,
//         courseName: ['React', 'Angular', 'Vue'][i % 3],
//         lecturer: `Dr. Lecturer ${i + 1}`,
//         year: `20${22 + (i % 3)}`,
//         semester: ['A', 'B', 'C'][i % 3],
//       }));
//       localStorage.setItem("coursesList", JSON.stringify(coursesList));
//     }

//     // STUDENTS
//     let students = JSON.parse(localStorage.getItem("students"));
//     if (!students) {
//       students = Array.from({ length: 10 }, (_, i) => ({
//         studentId: `12345678${i}`,
//         fullName: `Student`,
//         age: `${18 + i}`,
//         gender: ["Female", "Male"][i % 2],
//         year: `20${20 + (i % 5)}`,
//       }));
//       localStorage.setItem("students", JSON.stringify(students));
//     }

//     // TASKS
//     let tasks = JSON.parse(localStorage.getItem("tasks"));
//     if (!tasks) {
//       tasks = Array.from({ length: 10 }, (_, i) => ({
//         taskCode: Math.floor(Math.random() * 900 + 100),
//         courseCode: coursesList[i % coursesList.length].courseCode, // קישור לקורס
//         taskName: `Task ${i + 1}`,
//         submissionDate: "2025-06-01",
//         taskDescription: `Description for Task ${i + 1}`,
//       }));
//       localStorage.setItem("tasks", JSON.stringify(tasks));
//     }

//     // GRADES
//     let grades = JSON.parse(localStorage.getItem("grades"));
//     if (!grades) {
//       grades = tasks.map((task, i) => ({
//         idNumber: students[i]?.studentId || `30000${i}`, // ✅ לוקחים ID מהסטודנט התואם
//         taskGrade: Math.floor(Math.random() * 41 + 60),
//         taskName: task.taskName,
//         taskCode: task.taskCode,
//       }));
//       localStorage.setItem("grades", JSON.stringify(grades));
//     }

//     // MESSAGES
//     let messages = JSON.parse(localStorage.getItem("messages"));
//     if (!messages) {
//       messages = tasks.map((task, i) => ({
//         messageCode: `M${i + 1}`,
//         courseCode: task.courseCode,
//         courseName: coursesList.find(c => c.courseCode === task.courseCode)?.courseName || '',
//         assignmentCode: task.taskCode,
//         assignmentName: task.taskName,
//         messageContent: `Important message about ${task.taskName}`,
//       }));
//       localStorage.setItem("messages", JSON.stringify(messages));
//     }

//     console.log("Default data loaded to Local Storage.");
//   }, []);

//   return (
//     <div style={{ padding: "2rem" }}>
//       <h1>Welcome to the System</h1>
//       <p>Initial data for tasks, grades, students, messages, and courses has been loaded.</p>
//     </div>
//   );
// }
// HomePage.jsx - כולל הצגת מטלות לפי קורסים

// HomePage.jsx - מציג מידע מלא כולל הודעות לפי קורס ומטלה
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Divider,
  LinearProgress,
} from "@mui/material";
import { listStudent } from "../firebase/student";

export default function HomePage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const coursesList = JSON.parse(localStorage.getItem("coursesList"));
    setCourses(coursesList || []);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const firestoreStudents = await listStudent();
        const gradesData = JSON.parse(localStorage.getItem("grades")) || [];
        const tasksData = JSON.parse(localStorage.getItem("tasks")) || [];
        const messagesData = JSON.parse(localStorage.getItem("messages")) || [];

        setStudents(firestoreStudents);
        setGrades(gradesData);
        setTasks(tasksData);
        setMessages(messagesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;

    const firestoreStudent = students.find(s => s.studentId === selectedStudentId);
    if (!firestoreStudent) return;

    const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
    const localStudent = storedStudents.find(s => s.studentId === selectedStudentId);
    const courseCodes = localStudent?.courses || [];

    const studentCourses = courses.filter(c => courseCodes.includes(c.courseCode));
    const studentTasks = tasks.filter(t => courseCodes.includes(t.courseCode));
    const studentGrades = grades.filter(g => g.idNumber === selectedStudentId);

    const studentMessages = messages.filter(m => {
      const taskMatch = m.assignmentCode
        ? studentTasks.some(t => t.taskCode === m.assignmentCode)
        : true;
      const courseMatch = m.courseCode
        ? courseCodes.includes(m.courseCode)
        : true;
      const studentMatch = !m.studentId || m.studentId === selectedStudentId;
      return taskMatch && courseMatch && studentMatch;
    });

    setStudentInfo({
      ...firestoreStudent,
      courses: studentCourses,
      grades: studentGrades,
      tasks: studentTasks,
      messages: studentMessages,
    });
  }, [selectedStudentId, students, courses, grades, tasks, messages]);

  if (isLoading) return <LinearProgress />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Welcome to the System</Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Student</InputLabel>
        <Select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          label="Select Student"
        >
          {students.map(s => (
            <MenuItem key={s.studentId} value={s.studentId}>
              {s.fullName} ({s.studentId})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {studentInfo && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6">Student Details:</Typography>
          <p><strong>ID:</strong> {studentInfo.studentId}</p>
          <p><strong>Name:</strong> {studentInfo.fullName}</p>
          <p><strong>Age:</strong> {studentInfo.age}</p>
          <p><strong>Gender:</strong> {studentInfo.gender}</p>
          <p><strong>Year:</strong> {studentInfo.year}</p>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Courses:</Typography>
          {studentInfo.courses.length > 0 ? (
            studentInfo.courses.map((c, i) => (
              <p key={i}>🔹 {c.courseName} ({c.courseCode}) - {c.semester} {c.year}</p>
            ))
          ) : (
            <p>No courses assigned.</p>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Tasks:</Typography>
          {studentInfo.tasks.length > 0 ? (
            studentInfo.tasks.map((t, i) => (
              <p key={i}>📝 {t.taskName} ({t.courseCode}) - Due: {t.submissionDate}</p>
            ))
          ) : (
            <p>No tasks available.</p>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Grades:</Typography>
          {studentInfo.grades.map((g, i) => {
            const task = studentInfo.tasks.find(t => t.taskCode === g.taskCode);
            const taskName = task ? task.taskName : "Unknown Task";
            return (
              <p key={i}>📘 {taskName} ({g.taskCode}): {g.taskGrade}</p>
            );
          })}

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Messages:</Typography>
          {studentInfo.messages.length > 0 ? (
            studentInfo.messages.map((m, i) => {
              const course = courses.find(c => c.courseCode === m.courseCode);
              const task = tasks.find(t => t.taskCode === m.assignmentCode);
              return (
                <Box key={i} sx={{ mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    📩message in the course of {course ? course.courseName : m.courseCode}
                    {task ? ` |assignment ${task.taskName}` : ""}
                  </Typography>
                  <Typography>{m.messageContent}</Typography>
                </Box>
              );
            })
          ) : (
            <p>No messages.</p>
          )}
        </Paper>
      )}
    </Box>
  );
}
