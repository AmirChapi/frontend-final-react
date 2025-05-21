import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";
import { listStudent } from "../firebase/student";
import { addMessage, updateMessage } from "../firebase/message";

export default function MessageForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const messageToEdit = location.state?.messageToEdit || null;

  const [formData, setFormData] = useState({
    messageContent: "",
    courseCode: "",
    assignmentCode: "",
    studentId: "",
  });

  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    async function fetchData() {
      const [c, t, s] = await Promise.all([
        listCourses(),
        listTasks(),
        listStudent(),
      ]);
      setCourses(c);
      setTasks(t);
      setStudents(s);
    }

    fetchData();

    if (messageToEdit) {
      setFormData(messageToEdit);
    }
  }, [messageToEdit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.messageContent.trim()) newErrors.messageContent = "Message content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (formData.id) {
        await updateMessage(formData);
        setSnackbar({ open: true, message: "Message updated", severity: "success" });
      } else {
        await addMessage(formData);
        setSnackbar({ open: true, message: "Message added", severity: "success" });
      }

      setTimeout(() => navigate("/MSGManage"), 1000);
    } catch (err) {
      setSnackbar({ open: true, message: "Error saving message", severity: "error" });
    }
  };

  const handleCancel = () => {
    navigate("/MSGManage");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, width: 500 }}>
        <Typography variant="h6" gutterBottom>
          {formData.id ? "Edit Message" : "Add Message"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Message Content"
            name="messageContent"
            value={formData.messageContent}
            onChange={handleChange}
            error={!!errors.messageContent}
            helperText={errors.messageContent}
            multiline
            rows={3}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            name="courseCode"
            label="Course (optional)"
            value={formData.courseCode}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {courses.map((c) => (
              <MenuItem key={c.id} value={c.courseCode}>
                {c.courseCode} - {c.courseName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            name="assignmentCode"
            label="Task (optional)"
            value={formData.assignmentCode}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {tasks.map((t) => (
              <MenuItem key={t.id} value={t.taskCode}>
                {t.taskCode} - {t.taskName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            name="studentId"
            label="Student ID (optional)"
            value={formData.studentId}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value=""><em>All students</em></MenuItem>
            {students.map((s) => (
              <MenuItem key={s.id} value={s.studentId}>
                {s.studentId} - {s.fullName}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2} mt={2}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {formData.id ? "Update" : "Save"}
            </Button>
            <Button variant="outlined" color="secondary" fullWidth onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
