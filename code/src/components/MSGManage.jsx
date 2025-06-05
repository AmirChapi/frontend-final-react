// MSGManage.jsx
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

export default function MSGManage() {
  const [messages, setMessages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const [msgs, crs, tks] = await Promise.all([
        listMessages(),
        listCourses(),
        listTasks(),
      ]);

      const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));

      let studentMessages = msgs;

      if (selectedStudent) {
        studentMessages = msgs.filter((m) =>
          // הודעה לקורס שהסטודנט רשום אליו
          (m.courseCode && selectedStudent.courses?.some(c => c.courseCode === m.courseCode)) ||
          // או הודעה אישית לפי studentId
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
    navigate("/MSGForm", { state: { messageToEdit: message } });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (confirmDelete) {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }
  };

  const handleAdd = () => {
    navigate("/MSGForm");
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
      <Typography variant="h4" gutterBottom>
        Message Management
      </Typography>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add New Message
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Existing Messages
      </Typography>

      <TableContainer component={Paper} sx={{border: '1px solid black'}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" , backgroundColor: '#add8e6'}}>Content</TableCell>
              <TableCell sx={{ fontWeight: "bold" , backgroundColor: '#add8e6'}}>Course Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" , backgroundColor: '#add8e6'}}>Course Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" , backgroundColor: '#add8e6'}}>Task Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" , backgroundColor: '#add8e6'}}>Task Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" , backgroundColor: '#add8e6'}}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" , backgroundColor: '#add8e6'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell>{msg.messageContent}</TableCell>
                  <TableCell>{msg.courseCode || "-"}</TableCell>
                  <TableCell>{msg.courseCode ? getCourseName(msg.courseCode) : "-"}</TableCell>
                  <TableCell>{msg.assignmentCode || "-"}</TableCell>
                  <TableCell>{msg.assignmentCode ? getTaskName(msg.assignmentCode) : "-"}</TableCell>
                  <TableCell>{msg.studentId || "-"}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="info" onClick={() => handleEdit(msg)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(msg.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {msg.assignmentCode && (
                        <IconButton color="primary" onClick={() => handleGoToGrades(msg.assignmentCode)}>
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
