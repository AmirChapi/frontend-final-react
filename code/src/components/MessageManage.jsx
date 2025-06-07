import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  LinearProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useNavigate } from "react-router-dom";
import { listMessages, deleteMessage } from "../firebase/message";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";

export default function MessageManage() {
  const [messages, setMessages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const [messages, crs, tks] = await Promise.all([
        listMessages(),
        listCourses(),
        listTasks(),
      ]);

      const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));

      let studentMessages = messages;

      if (selectedStudent) {
        studentMessages = messages.filter((m) =>
          (m.courseCode && selectedStudent.courses?.some(c => c.courseCode === m.courseCode)) ||
          (m.studentId && m.studentId === selectedStudent.studentId)
        );
      }

      setMessages(studentMessages);
      setCourses(crs);
      setTasks(tks);
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleEdit = (message) => {
    navigate(`/MessageForm/${message.id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (confirmDelete) {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((message) => message.id !== id));
    }
  };

  const handleAdd = () => {
    navigate("/MessageForm");
  };

  const getCourseName = (courseCode) => {
    const course = courses.find((c) => c.courseCode === courseCode);
    return course ? course.courseName : courseCode;
  };

  const getTaskName = (taskCode) => {
    const task = tasks.find((t) => t.taskCode === taskCode);
    return task ? task.taskName : taskCode;
  };

  const handleGoToGrades = (taskCode) => {
    navigate("/GradeManage", { state: { filterTaskCode: taskCode } });
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ padding: 4 }}>
      {/* כותרת ממורכזת */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3d3d3d' }}
      >
        Message Management
      </Typography>

      {/* משפט הסבר */}
      <Typography
        variant="subtitle1"
        textAlign="center"
        sx={{
          mb: 3,
          color: '#555',
          fontWeight: 500,
          fontSize: '1.1rem',
        }}
      >
        Messages relevant to the selected student.
      </Typography>

      {/* כפתור הוספה בעיצוב מותאם */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleAdd}
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
          }}
        >
          Add New Message
        </Button>
      </Box>

      {/* טבלה */}
      <TableContainer
        component={Paper}
        sx={{
          border: '2px solid #c0aa92',
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: '#ebdfd1' }}>Content</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: '#ebdfd1' }}>Course Code</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: '#ebdfd1' }}>Course Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: '#ebdfd1' }}>Task Code</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: '#ebdfd1' }}>Task Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: '#ebdfd1' }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: '#ebdfd1' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.length > 0 ? (
              messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>{message.messageContent}</TableCell>
                  <TableCell>{message.courseCode || "-"}</TableCell>
                  <TableCell>{message.courseCode ? getCourseName(message.courseCode) : "-"}</TableCell>
                  <TableCell>{message.assignmentCode || "-"}</TableCell>
                  <TableCell>{message.assignmentCode ? getTaskName(message.assignmentCode) : "-"}</TableCell>
                  <TableCell>{message.studentId || "-"}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="info" onClick={() => handleEdit(message)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(message.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {message.assignmentCode && (
                        <IconButton color="primary" onClick={() => handleGoToGrades(message.assignmentCode)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No messages to display.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
