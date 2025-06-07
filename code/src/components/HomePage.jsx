import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";
import { listGrades } from "../firebase/grade";
import { listMessages } from "../firebase/message";
import { listStudent } from "../firebase/student";

export default function HomePage() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFreshStudent = async (studentId) => {
    const allStudents = await listStudent();
    return allStudents.find((s) => s.studentId === studentId);
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const stored = JSON.parse(localStorage.getItem("selectedStudent"));

      if (!stored || stored.studentId === "All Students") {
        setSelectedStudent(null);
        setIsLoading(false);
        return;
      }

      const freshStudent = await fetchFreshStudent(stored.studentId);
      setSelectedStudent(freshStudent || null);

      const [coursesData, tasksData, gradesData, messagesData] = await Promise.all([
        listCourses(),
        listTasks(),
        listGrades(),
        listMessages(),
      ]);

      setCourses(coursesData);
      setTasks(tasksData);
      setGrades(gradesData);
      setMessages(messagesData);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedStudent || !Array.isArray(selectedStudent.courses)) {
      setStudentInfo(null);
      return;
    }

    const studentCourseCodes = selectedStudent.courses.map((code) => code.toString());

    const studentCourses = (Array.isArray(courses) ? courses : []).filter((course) =>
      studentCourseCodes.includes(course.courseCode.toString())
    );

    const now = new Date();

    const studentTasks = (Array.isArray(tasks) ? tasks : [])
      .filter(
        (task) =>
          studentCourseCodes.includes(task.courseCode?.toString()) &&
          new Date(task.submissionDate) >= now
      )
      .sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate))
      .slice(0, 3);

    const studentMessages = (Array.isArray(messages) ? messages : [])
      .filter((msg) => msg.studentId?.toString() === selectedStudent.studentId?.toString())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);

    setStudentInfo({
      ...selectedStudent,
      courses: studentCourses,
      tasks: studentTasks,
      messages: studentMessages,
    });
  }, [selectedStudent, courses, tasks, messages]);

  if (!selectedStudent) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#555', mt: 10 }}>
          This page is intended to display data when a student is selected from the list.
        </Typography>
      </Box>
    );
  }

  if (isLoading) return <LinearProgress />;

  const cardStyle = {
    flex: '1 1 45%',
    minWidth: 280,
    borderRadius: 4,
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    border: '2.5px solid #ebdfd1',
    backgroundColor: '#fff',
    p: 2,
  };

  const sectionTitle = {
    fontSize: '1.3rem',
    fontWeight: 600,
    color: '#5c5470',
    mb: 1,
  };

  const labelStyle = {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#6a6a6a',
    mt: 1,
  };

  const valueStyle = {
    fontWeight: 500,
    fontSize: '1.1rem',
    color: '#333',
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff', p: 4, fontFamily: 'Rubik, sans-serif' }}>
      <Typography variant="h4" textAlign="center" sx={{ fontWeight: 700, color: '#221e20', mb: 1 }}>
        Welcome, {studentInfo.fullName}
      </Typography>

      <Typography variant="body1" textAlign="center" sx={{ color: "#221e20", mb: 4, fontSize: "1.3rem" }}>
        Here’s a quick overview of your courses, upcoming tasks, and messages. Let’s make today productive!
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between' }}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography sx={sectionTitle}>👩‍🎓 Student Info</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography sx={labelStyle}>ID:</Typography>
              <Typography sx={valueStyle}>{studentInfo.studentId}</Typography>
              <Typography sx={labelStyle}>Name:</Typography>
              <Typography sx={valueStyle}>{studentInfo.fullName}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={cardStyle}>
          <CardContent>
            <Typography sx={sectionTitle}>📚 Courses</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              You are currently enrolled in:
            </Typography>
            <Box sx={{ mt: 1 }}>
              {studentInfo.courses && studentInfo.courses.length > 0 ? (
                studentInfo.courses.map((c, i) => (
                  <Typography key={i} sx={valueStyle}>
                    • {c.courseName}
                  </Typography>
                ))
              ) : (
                <Typography>No courses assigned.</Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card sx={cardStyle}>
          <CardContent>
            <Typography sx={sectionTitle}>📝 Upcoming Tasks</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Next 3 tasks:
            </Typography>
            <Box sx={{ mt: 1 }}>
              {studentInfo.tasks && studentInfo.tasks.length > 0 ? (
                studentInfo.tasks.map((t, i) => (
                  <Typography key={i} sx={valueStyle}>
                    • {t.taskName} – {new Date(t.submissionDate).toLocaleDateString()}
                  </Typography>
                ))
              ) : (
                <Typography>No upcoming tasks.</Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card sx={cardStyle}>
          <CardContent>
            <Typography sx={sectionTitle}>💬 Latest Messages</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Most recent messages sent to you:
            </Typography>
            <Box sx={{ mt: 1 }}>
              {studentInfo.messages && studentInfo.messages.length > 0 ? (
                <>
                  {studentInfo.messages.map((m, i) => (
                    <Typography key={i} sx={valueStyle}>
                      • {m.messageContent}
                    </Typography>
                  ))}
                  <Button
                    variant="outlined"
                    sx={{ mt: 2, borderColor: '#c084f5', color: '#944ce0', '&:hover': { borderColor: '#944ce0', backgroundColor: '#f5e9fc' } }}
                    onClick={() => navigate("/MessageManage")}
                  >
                    Go to All Messages
                  </Button>
                </>
              ) : (
                <Typography>No messages.</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

