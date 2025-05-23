// HomePage.jsx - Student Dashboard - מציג את כל ההודעות בצורה פשוטה וברורה

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
  LinearProgress
} from "@mui/material";

import { listStudent } from "../firebase/student";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";
import { listGrades } from "../firebase/grade";
import { listMessages } from "../firebase/message";

export default function HomePage() {
  const [students, setStudents] = useState([]); // רשימת כל הסטודנטים
  const [selectedStudentId, setSelectedStudentId] = useState(""); // מזהה הסטודנט הנבחר
  const [studentInfo, setStudentInfo] = useState(null); // פרטי הסטודנט הנבחר
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // מצב טעינה

  // טוען את כל הנתונים מ-Firestore כשהדף נטען
  useEffect(() => {
    async function fetchAll() {
      const [studentsData, coursesData, tasksData, gradesData, messagesData] = await Promise.all([
        listStudent(),
        listCourses(),
        listTasks(),
        listGrades(),
        listMessages(),
      ]);

      setStudents(studentsData);
      setCourses(coursesData);
      setTasks(tasksData);
      setGrades(gradesData);
      setMessages(messagesData);
      setIsLoading(false);
    }

    fetchAll();
  }, []);

  // מחשב את המידע של הסטודנט שנבחר
  useEffect(() => {
    if (!selectedStudentId || students.length === 0) return;

    const student = students.find((s) => s.studentId === selectedStudentId);
    if (!student) return;

    const courseCodes = student.courses || [];
    const studentCourses = courses.filter((c) => courseCodes.includes(c.courseCode));
    const studentTasks = tasks.filter((t) => courseCodes.includes(t.courseCode));
    const studentGrades = grades.filter((g) => g.idNumber === selectedStudentId);

    const studentMessages = messages.filter((m) => {
      const taskMatch = m.assignmentCode ? studentTasks.some((t) => t.taskCode === m.assignmentCode) : true;
      const courseMatch = m.courseCode ? courseCodes.includes(m.courseCode) : true;
      const studentMatch = !m.studentId || m.studentId === selectedStudentId;
      return taskMatch && courseMatch && studentMatch;
    });

    // ממיין את ההודעות כך שהאחרונה תופיע ראשונה
    const sortedMessages = [...studentMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setStudentInfo({
      ...student,
      courses: studentCourses,
      grades: studentGrades,
      tasks: studentTasks,
      messages: sortedMessages,
    });
  }, [selectedStudentId, students, courses, tasks, grades, messages]);

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
          {students.map((s) => (
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
          {studentInfo.grades.length > 0 ? (
            studentInfo.grades.map((g, i) => {
              const task = studentInfo.tasks.find(t => t.taskCode === g.taskCode);
              const taskName = task ? task.taskName : "Unknown Task";
              return (
                <p key={i}>📘 {taskName} ({g.taskCode}): {g.taskGrade}</p>
              );
            })
          ) : (
            <p>No grades.</p>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Messages:</Typography>
          {studentInfo.messages.length > 0 ? (
            studentInfo.messages.map((m, i) => {
              const course = courses.find(c => c.courseCode === m.courseCode);
              const task = tasks.find(t => t.taskCode === m.assignmentCode);
              return (
                <Box key={i} sx={{ mb: 1, p: 1.5, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    📩 Message for course: {course ? course.courseName : m.courseCode}
                    {task ? ` | Task: ${task.taskName}` : ""}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>{m.messageContent}</Typography>
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