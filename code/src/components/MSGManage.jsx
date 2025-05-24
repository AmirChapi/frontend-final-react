// MessagesManage.jsx - Message Management Page (Student-filtered + Navigate to Grades)

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
import GradeIcon from '@mui/icons-material/Grade'; // אייקון של כוכב לדילוג לדף הציונים

import { useNavigate } from "react-router-dom";
import { listMessages, deleteMessage } from "../firebase/message";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";

export default function MessagesManage() {
  const [messages, setMessages] = useState([]); // הודעות להצגה בטבלה
  const [courses, setCourses] = useState([]); // קורסים להצגת שמות קורסים
  const [tasks, setTasks] = useState([]); // מטלות להצגת שמות מטלות
  const navigate = useNavigate(); // הפונקציה שתאפשר לנו לנווט לעמודים אחרים

  useEffect(() => {
    async function fetchData() {
      const [msgs, crs, tks] = await Promise.all([
        listMessages(),
        listCourses(),
        listTasks(),
      ]);

      const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));

      if (selectedStudent) {
        const studentMessages = msgs.filter((m) => {
          // בודק אם קוד הקורס תואם לקורסים של הסטודנט
          const courseMatch = m.courseCode ? selectedStudent.courses.some(c => c.courseCode === m.courseCode) : true;
          // בודק אם קוד המטלה תואם למטלות של הסטודנט
          const taskMatch = m.assignmentCode ? selectedStudent.tasks.some(t => t.taskCode === m.assignmentCode) : true;
          // בודק אם ההודעה נשלחה לסטודנט הספציפי או שהיא כללית
          const studentMatch = !m.studentId || m.studentId === selectedStudent.studentId;
          return courseMatch && taskMatch && studentMatch;
        });

        setMessages(studentMessages);
      } else {
        setMessages(msgs); // אם לא נבחר סטודנט, מציג את כל ההודעות
      }

      setCourses(crs); // שמירת הקורסים בסטייט
      setTasks(tks); // שמירת המטלות בסטייט
    }

    fetchData();
  }, []);

  // ניווט לעריכת הודעה מסוימת
  const handleEdit = (message) => {
    navigate("/MSGForm", { state: { messageToEdit: message } });
  };

  // מחיקת הודעה
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this message?");
    if (confirm) {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }
  };

  // מעבר לדף הוספת הודעה
  const handleAdd = () => {
    navigate("/MSGForm");
  };

  // מחזיר את שם הקורס על פי קוד הקורס
  const getCourseName = (courseCode) => {
    const course = courses.find(c => c.courseCode === courseCode);
    return course ? course.courseName : courseCode;
  };

  // מחזיר את שם המטלה על פי קוד המטלה
  const getTaskName = (taskCode) => {
    const task = tasks.find(t => t.taskCode === taskCode);
    return task ? task.taskName : taskCode;
  };

  // כפתור מעבר לדף הציונים, עם קוד מטלה מסוים (ספציפי)
  const handleGoToGrades = (taskCode) => {
    navigate("/GradeManage", { state: { filterTaskCode: taskCode } });
  };

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Content</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Course Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Course Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Task Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Task Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
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
                          <GradeIcon fontSize="small" />
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
