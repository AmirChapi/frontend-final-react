// HomePage.jsx - Student Dashboard (Minimal Info + 3 Closest Tasks/Messages)

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
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { listStudent } from "../firebase/student";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";
import { listGrades } from "../firebase/grade";
import { listMessages } from "../firebase/message";


export default function HomePage() {
  const [students, setStudents] = useState([]); // רשימת הסטודנטים
  const [selectedStudentId, setSelectedStudentId] = useState(""); // ת"ז של הסטודנט שנבחר
  const [studentInfo, setStudentInfo] = useState(null); // המידע המעובד של הסטודנט
  const [courses, setCourses] = useState([]); // רשימת קורסים
  const [grades, setGrades] = useState([]); // רשימת ציונים (לא מוצגים בדף)
  const [tasks, setTasks] = useState([]); // רשימת מטלות
  const [messages, setMessages] = useState([]); // רשימת הודעות
  const [isLoading, setIsLoading] = useState(true); // האם טוען נתונים
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("selectedStudent");

    // טוען את כל הנתונים מה-Database
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

  useEffect(() => {
    if (!selectedStudentId || students.length === 0) return;

    // מוצא את האובייקט של הסטודנט הנבחר
    const student = students.find((s) => s.studentId === selectedStudentId);
    if (!student) return;

    // קורסים שהסטודנט רשום אליהם
    const courseCodes = student.courses || [];

    // לוקח את הקורסים המלאים שהסטודנט משויך אליהם
    const studentCourses = courses.filter((c) => courseCodes.includes(c.courseCode));

    // סינון מטלות לפי קורסים של הסטודנט
    // מיון לפי תאריך ההגשה הקרוב ביותר להיום (מהעתיד הקרוב לעתיד הרחוק)
    const now = new Date();
    const studentTasks = tasks
      .filter((t) => courseCodes.includes(t.courseCode))
      .filter((t) => new Date(t.submissionDate) >= now) // רק מטלות שעוד לא עבר התאריך שלהן
      .sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate)) // הקרובה ביותר ראשונה
      .slice(0, 3); // שלושת הקרובות ביותר

    // סינון הודעות לפי קורסים של הסטודנט והאם הן אישיות או כלליות
    const studentMessages = messages
      .filter((m) => {
        const courseMatch = m.courseCode ? courseCodes.includes(m.courseCode) : true;
        const studentMatch = !m.studentId || m.studentId === selectedStudentId;
        return courseMatch && studentMatch;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // ממיין מהאחרונה לראשונה
      .slice(0, 3); // שלוש האחרונות

    // אובייקט מידע לתצוגה ולשיתוף עם דפים אחרים
    const studentData = {
      studentId: student.studentId,
      fullName: student.fullName,
      courses: studentCourses,
      tasks: studentTasks,
      messages: studentMessages,
    };

    setStudentInfo(studentData);
    localStorage.setItem("selectedStudent", JSON.stringify(studentData)); // שומר את המידע של הסטודנט ב-localStorage
  }, [selectedStudentId, students, courses, tasks, messages]);

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
          <Typography variant="h6" gutterBottom>Student Info:</Typography>
          <p><strong>ID:</strong> {studentInfo.studentId}</p>
          <p><strong>Name:</strong> {studentInfo.fullName}</p>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Courses:</Typography>
          {studentInfo.courses.length > 0 ? (
            studentInfo.courses.map((c, i) => (
              <p key={i}>📘 {c.courseName} ({c.courseCode}) - {c.semester} {c.year}</p>
            ))
          ) : (
            <p>No courses assigned.</p>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Upcoming Tasks:</Typography>
          {studentInfo.tasks.length > 0 ? (
            studentInfo.tasks.map((t, i) => (
              <p key={i}>📝 {t.taskName} ({t.courseCode}) - Due: {t.submissionDate}</p>
            ))
          ) : (
            <p>No tasks available.</p>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Latest Messages:</Typography>
          {studentInfo.messages.length > 0 ? (
            <>
              {studentInfo.messages.map((m, i) => (
                <Box key={i} sx={{ mb: 1, p: 1.5, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>{m.messageContent}</Typography>
                </Box>
              ))}
              <Button variant="outlined" color="primary" onClick={() => navigate("/MSGManage")}>
                Go to All Messages
              </Button>
            </>
          ) : (
            <p>No messages.</p>
          )}
        </Paper>
      )}
    </Box>
  );
}
