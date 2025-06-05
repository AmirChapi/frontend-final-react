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

export default function HomePage() {
  const [studentInfo, setStudentInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));

  useEffect(() => {
    async function fetchAll() {
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

    fetchAll();
  }, []);

  useEffect(() => {
    if (!selectedStudent || !Array.isArray(selectedStudent.courses)) return;

    const courseCodes = selectedStudent.courses.map(String);

    const studentCourses = courseCodes
      .map(code => courses.find(c => c.courseCode.toString() === code))
      .filter(Boolean);

    const now = new Date();
    const studentTasks = tasks
      .filter(t => courseCodes.includes(t.courseCode?.toString()))
      .filter(t => new Date(t.submissionDate) >= now)
      .sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate))
      .slice(0, 3);

    const studentMessages = messages
      .filter((m) => m.studentId?.toString() === selectedStudent.studentId.toString())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);

    const studentData = {
      ...selectedStudent,
      courses: studentCourses,
      tasks: studentTasks,
      messages: studentMessages,
    };

    setStudentInfo(studentData);
  }, [courses, tasks, messages]);

  if (isLoading) return <LinearProgress />;

  if (!selectedStudent) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please select a student from the top menu
        </Typography>
        <Typography variant="body1" color="text.secondary">
          After selecting a student, you will see a summary of their courses, tasks, and messages here.
        </Typography>
      </Box>
    );
  }

  return (
<Box sx={{ minHeight: '100vh', backgroundColor: '#f0f0f0', p: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold">
        Welcome to the System
      </Typography>

      <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
        This dashboard shows a snapshot of the latest courses, upcoming tasks, and recent messages for the selected student.
      </Typography>

      {studentInfo && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'space-between',
          }}
        >
          {/* Student Info */}
          <Card
            variant="outlined"
            sx={{
              flex: '1 1 45%',
              minWidth: 280,
              borderRadius: 3,
              boxShadow: 3,
              border: '2px solid #81d4fa',
              backgroundColor: '#e0f7fa',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Student Info
              </Typography>
              <Typography><strong>ID:</strong> {studentInfo.studentId}</Typography>
              <Typography><strong>Name:</strong> {studentInfo.fullName}</Typography>
            </CardContent>
          </Card>

          {/* Courses */}
          <Card
            variant="outlined"
            sx={{
              flex: '1 1 45%',
              minWidth: 280,
              borderRadius: 3,
              boxShadow: 3,
              border: '2px solid #81d4fa',
              backgroundColor: '#e0f7fa',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Courses
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                * Showing all assigned courses
              </Typography>
              {studentInfo.courses.length > 0 ? (
                studentInfo.courses.map((c, i) => (
                  <Typography key={i} variant="body2">
                    📘 {c.courseName}
                  </Typography>
                ))
              ) : (
                <Typography>No courses assigned.</Typography>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card
            variant="outlined"
            sx={{
              flex: '1 1 45%',
              minWidth: 280,
              borderRadius: 3,
              boxShadow: 3,
              border: '2px solid #81d4fa',
              backgroundColor: '#e0f7fa',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Upcoming Tasks
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                * Displaying up to 3 nearest tasks
              </Typography>
              {studentInfo.tasks.length > 0 ? (
                studentInfo.tasks.map((t, i) => (
                  <Typography key={i} variant="body2">
                    📄 {t.taskName}
                  </Typography>
                ))
              ) : (
                <Typography>No tasks available.</Typography>
              )}
            </CardContent>
          </Card>

          {/* Latest Messages */}
          <Card
            variant="outlined"
            sx={{
              flex: '1 1 45%',
              minWidth: 280,
              borderRadius: 3,
              boxShadow: 3,
              border: '2px solid #81d4fa',
              backgroundColor: '#e0f7fa',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Latest Messages
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                * Displaying 3 most recent messages
              </Typography>
              {studentInfo.messages.length > 0 ? (
                <>
                  {studentInfo.messages.map((m, i) => (
                    <Typography key={i} variant="body2">
                      📩 {m.messageContent}
                    </Typography>
                  ))}
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 1 }}
                    onClick={() => navigate("/MSGManage")}
                  >
                    Go to All Messages
                  </Button>
                </>
              ) : (
                <Typography>No messages.</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
