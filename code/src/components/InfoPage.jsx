import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from "recharts";

export default function InfoPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [grades, setGrades] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

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
  }, [location]);

  useEffect(() => {
    if (!selectedStudentId || students.length === 0) {
      setStudentData(null);
      return;
    }
    const student = students.find((s) => s.studentId === selectedStudentId);
    if (!student) return;

    const courseCodes = student.courses || [];
    const studentCourses = courses.filter((c) => courseCodes.includes(c.courseCode));
    const studentTasks = tasks.filter((t) => courseCodes.includes(t.courseCode));
    const studentGrades = grades.filter(
      (g) => g.studentId === selectedStudentId || g.idNumber === selectedStudentId
    );
    const studentMessages = messages.filter((m) => {
      const courseMatch = m.courseCode ? courseCodes.includes(m.courseCode) : true;
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

  if (isLoading) return <LinearProgress />;

  if (!selectedStudentId || !studentData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: '#bb2f13' }}>
        <Typography variant="h5" gutterBottom>
          ⚠️  This page is intended for a specific student, please select a student from the list.
        </Typography>
      </Box>
    );
  }

  const { student, studentCourses, studentTasks, studentGrades, studentMessages } = studentData;

  const gradeData = studentGrades.map((g) => {
    const task = tasks.find((t) => t.taskCode === g.taskCode);
    return {
      name: task ? task.taskName : g.taskCode,
      grade: Number(g.taskGrade),
    };
  });

  const averageGrade = gradeData.length
    ? (gradeData.reduce((acc, item) => acc + item.grade, 0) / gradeData.length).toFixed(1)
    : 0;

  const motivationMessage = averageGrade == 0
    ? "From here, the only way is up!"
    : averageGrade <= 60
      ? "Keep pushing! You can do it!"
      : averageGrade <= 85
        ? "You're doing great, just a bit more effort!"
        : "You're on a roll! Keep it up!";

  return (
    <Box sx={{ p: 4, fontFamily: 'Arial', backgroundColor: '#ffffff' }}>
      <Box
        sx={{
          border: '2px solid #c0aa92',
          borderRadius: 2,
          p: 4,
          maxWidth: '1000px',
          margin: 'auto',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Student Full Profile
        </Typography>

        <Typography align="center" sx={{ mb: 2, fontSize: '1.2rem'}}>
          🧠 <strong>Average Grade:</strong> {averageGrade} <br />
          📚 <strong>Total Courses:</strong> {studentCourses.length} <br />
          📝 <strong>Total Tasks:</strong> {studentTasks.length} <br />
          💬 <strong>Total Messages:</strong> {studentMessages.length}
        </Typography>

        <Typography align="center" sx={{ mb: 4, color: '#591816' ,fontSize: '1.8rem' }}>
          {motivationMessage}
        </Typography>


        <Divider sx={{ mb: 1 }} />
        <Typography variant="h6">Student Info</Typography>
        <Typography>Name: {student.fullName}</Typography>
        <Typography>ID: {student.studentId}</Typography>
        <Typography>Age: {student.age}</Typography>
        <Typography>Registration Year: {student.year}</Typography>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Courses</Typography>
        {studentCourses.map((c, i) => (
          <Typography key={i}>• {c.courseName} ({c.courseCode})</Typography>
        ))}

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Tasks</Typography>
        {studentTasks.map((t, i) => (
          <Typography key={i}>• {t.taskName} - Due: {t.submissionDate}</Typography>
        ))}

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Messages</Typography>
        {studentMessages.map((m, i) => (
          <Typography key={i}>• {m.messageContent}</Typography>
        ))}

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Grades</Typography>
        {studentGrades.map((g, i) => {
          const task = tasks.find((t) => t.taskCode === g.taskCode);
          return (
            <Typography key={i}>• {task ? task.taskName : g.taskCode}: {g.taskGrade}</Typography>
          );
        })}

        {gradeData.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Grade Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="Tasks" position="bottom" offset={0} />
                </XAxis>
                <YAxis domain={[0, 100]}>
                  <Label value="Grade" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip formatter={(value) => [`${value}`, 'Grade']} />
                <ReferenceLine y={Number(averageGrade)} stroke="red" strokeDasharray="3 3" label={`Avg: ${averageGrade}`} />
                <Bar dataKey="grade" stroke="#8c6e54" fillOpacity={0} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        <Box mt={4} textAlign="center">
          <Button variant="contained" onClick={() => navigate("/")}
            sx={{
              backgroundColor: '#ebdfd1',
              color: '#000',
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              '&:hover': {
                backgroundColor: '#c0aa92',
              },
            }}>
            Back to Home
          </Button>
        </Box>
      </Box>
    </Box>
  );
}