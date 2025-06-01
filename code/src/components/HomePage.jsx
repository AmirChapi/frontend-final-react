// HomePage.jsx
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
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { listStudent } from "../firebase/student";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";
import { listGrades } from "../firebase/grade";
import { listMessages } from "../firebase/message";

export default function HomePage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("selectedStudent");
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

    const student = students.find((s) => s.studentId === selectedStudentId);
    if (!student) return;

    const courseCodes = student.courses || [];
    const studentCourses = courses.filter((c) => courseCodes.includes(c.courseCode));

    const now = new Date();
    const studentTasks = tasks
      .filter((t) => courseCodes.includes(t.courseCode))
      .filter((t) => new Date(t.submissionDate) >= now)
      .sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate))
      .slice(0, 3);

    const studentMessages = messages
      .filter((m) => {
        const courseMatch = m.courseCode ? courseCodes.includes(m.courseCode) : true;
        const studentMatch = !m.studentId || m.studentId === selectedStudentId;
        return courseMatch && studentMatch;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);

    const studentData = {
      studentId: student.studentId,
      fullName: student.fullName,
      courses: studentCourses,
      tasks: studentTasks,
      messages: studentMessages,
    };

    setStudentInfo(studentData);
    localStorage.setItem("selectedStudent", JSON.stringify(studentData));
  }, [selectedStudentId, students, courses, tasks, messages]);

  if (isLoading) return <LinearProgress />;

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Welcome to the System
      </Typography>

      <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
        This dashboard shows a snapshot of the latest courses, upcoming tasks, and recent messages for the selected student.
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Student Info</Typography>
                <Typography><strong>ID:</strong> {studentInfo.studentId}</Typography>
                <Typography><strong>Name:</strong> {studentInfo.fullName}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Courses</Typography>
                <Typography variant="caption" color="text.secondary">
                  * Showing currently assigned courses only
                </Typography>
                {studentInfo.courses.length > 0 ? (
                  studentInfo.courses.map((c, i) => (
                    <Typography key={i} variant="body2">
                      📘 {c.courseName} ({c.courseCode}) - {c.semester} {c.year}
                    </Typography>
                  ))
                ) : (
                  <Typography>No courses assigned.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Upcoming Tasks</Typography>
                <Typography variant="caption" color="text.secondary">
                  * Displaying up to 3 nearest tasks
                </Typography>
                {studentInfo.tasks.length > 0 ? (
                  studentInfo.tasks.map((t, i) => (
                    <Typography key={i} variant="body2">
                      📝 {t.taskName} ({t.courseCode}) - Due: {t.submissionDate}
                    </Typography>
                  ))
                ) : (
                  <Typography>No tasks available.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Latest Messages</Typography>
                <Typography variant="caption" color="text.secondary">
                  * Displaying 3 most recent messages
                </Typography>
                {studentInfo.messages.length > 0 ? (
                  <>
                    {studentInfo.messages.map((m, i) => (
                      <Box key={i} sx={{ mb: 1, p: 1.5, border: '1px solid #ccc', borderRadius: 2 }}>
                        <Typography sx={{ fontWeight: 'bold' }}>{m.messageContent}</Typography>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 1 }}
                      onClick={() => {
                        localStorage.setItem("selectedStudent", JSON.stringify(studentInfo));
                        navigate("/MSGManage");
                      }}
                    >
                      Go to All Messages
                    </Button>
                  </>
                ) : (
                  <Typography>No messages.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
