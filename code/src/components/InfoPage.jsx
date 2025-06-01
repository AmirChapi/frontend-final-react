import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  LinearProgress,
  Button,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { listStudent } from "../firebase/student";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";
import { listGrades } from "../firebase/grade";
import { listMessages } from "../firebase/message";

export default function StudentFullProfile() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [grades, setGrades] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation(); // ✅ עוקב אחרי שינוי כתובת

  useEffect(() => {
    async function fetchAll() {
      setIsLoading(true);

      const [studentsData, coursesData, tasksData, gradesData, messagesData] =
        await Promise.all([
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

      const savedStudent = JSON.parse(localStorage.getItem("selectedStudent"));
      if (savedStudent) {
        setSelectedStudentId(savedStudent.studentId);
      }

      setIsLoading(false);
    }

    fetchAll();
  }, [location]); // ✅ טוען מחדש בכל מעבר לעמוד

  useEffect(() => {
    if (!selectedStudentId || students.length === 0) {
      setStudentData(null); // ✅ שורה זו קיימת, אבל כעת נוסף תנאי תצוגה בהמשך
      return;
    }
    const student = students.find((s) => s.studentId === selectedStudentId);
    if (!student) return;

    const courseCodes = student.courses || [];
    const studentCourses = courses.filter((c) =>
      courseCodes.includes(c.courseCode)
    );
    const studentTasks = tasks.filter((t) =>
      courseCodes.includes(t.courseCode)
    );
    const studentGrades = grades.filter(
      (g) => g.studentId === selectedStudentId || g.idNumber === selectedStudentId
    );
    const studentMessages = messages.filter((m) => {
      const courseMatch = m.courseCode
        ? courseCodes.includes(m.courseCode)
        : true;
      const studentMatch = !m.studentId || m.studentId === selectedStudentId;
      return courseMatch && studentMatch;
    });

    setStudentData({
      student,
      studentCourses,
      studentTasks,
      studentGrades,
      studentMessages,
    });
  }, [selectedStudentId, students, courses, tasks, grades, messages]);

  // ✅ הוספת תנאי תצוגה: טעינה או אין תלמיד נבחר
  if (isLoading) return <LinearProgress />;

  if (!selectedStudentId || !studentData) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" color="error">
          ⚠️ You must select a student on the home page to view the profile.
        </Typography>
        <Box mt={2}>
          <Button variant="contained" onClick={() => navigate("/")}>
            BACK TO HOME 
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Full Profile
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={2}>
        <Paper elevation={3} sx={{ p: 2, width: 300 }}>
          <Typography variant="h6">Student Info</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography>
            <strong>Name:</strong> {studentData.student.fullName}
          </Typography>
          <Typography>
            <strong>ID:</strong> {studentData.student.studentId}
          </Typography>
          <Typography>
            <strong>Age:</strong> {studentData.student.age}
          </Typography>
          <Typography>
            <strong>Registration Year:</strong>{" "}
            {studentData.student.registrationYear}
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, width: 300 }}>
          <Typography variant="h6">Messages</Typography>
          <Divider sx={{ my: 1 }} />
          {studentData.studentMessages.length ? (
            studentData.studentMessages.map((m, i) => (
              <Box key={i} sx={{ mb: 1 }}>
                <Typography variant="body2">📩 {m.messageContent}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No messages.</Typography>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 2, width: 300 }}>
          <Typography variant="h6">Grades</Typography>
          <Divider sx={{ my: 1 }} />
          {studentData.studentGrades.length ? (
            studentData.studentGrades.map((g, i) => {
              const task = tasks.find((t) => t.taskCode === g.taskCode);
              const taskName = task ? task.taskName : g.taskCode;
              return (
                <Typography key={i} variant="body2">
                  📝 {taskName}: {g.taskGrade}
                </Typography>
              );
            })
          ) : (
            <Typography>No grades.</Typography>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 2, width: 300 }}>
          <Typography variant="h6">Courses</Typography>
          <Divider sx={{ my: 1 }} />
          {studentData.studentCourses.length ? (
            studentData.studentCourses.map((c, i) => (
              <Typography key={i} variant="body2">
                📘 {c.courseName} ({c.courseCode})
              </Typography>
            ))
          ) : (
            <Typography>No courses.</Typography>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 2, width: 300 }}>
          <Typography variant="h6">Tasks</Typography>
          <Divider sx={{ my: 1 }} />
          {studentData.studentTasks.length ? (
            studentData.studentTasks.map((t, i) => (
              <Typography key={i} variant="body2">
                📝 {t.taskName} - Due: {t.submissionDate}
              </Typography>
            ))
          ) : (
            <Typography>No tasks.</Typography>
          )}
        </Paper>
      </Box>

      <Box mt={4}>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
    </Box>
  );
}
