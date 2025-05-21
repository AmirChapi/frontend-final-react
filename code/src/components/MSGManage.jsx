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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";
import { listMessages, deleteMessage } from "../firebase/message";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";

export default function MessagesManage() {
  const [messages, setMessages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const [msgs, crs, tks] = await Promise.all([
        listMessages(),
        listCourses(),
        listTasks(),
      ]);
      setMessages(msgs);
      setCourses(crs);
      setTasks(tks);
    }

    fetchData();
  }, []);

  const handleEdit = (message) => {
    navigate("/MSGForm", { state: { messageToEdit: message } });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this message?");
    if (confirm) {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }
  };

  const handleAdd = () => {
    navigate("/MSGForm");
  };

  const getCourseName = (courseCode) => {
    const course = courses.find(c => c.courseCode === courseCode);
    return course ? course.courseName : courseCode;
  };

  const getTaskName = (taskCode) => {
    const task = tasks.find(t => t.taskCode === taskCode);
    return task ? task.taskName : taskCode;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        ניהול הודעות
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" onClick={handleAdd}>
          הוסף הודעה חדשה
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>תוכן</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>קוד קורס</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>שם קורס</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>קוד מטלה</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>שם מטלה</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>ת"ז סטודנט (אם יש)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">פעולות</TableCell>
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
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  אין הודעות להצגה.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
