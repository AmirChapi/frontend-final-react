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
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
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
      setFilteredTasks(t);
      setFilteredStudents(s);

      if (messageToEdit) {
        setFormData(messageToEdit);

        if (messageToEdit.courseCode) {
          const filteredT = t.filter((task) => task.courseCode === messageToEdit.courseCode);
          setFilteredTasks(filteredT);

          const filteredS = s.filter((stu) =>
            Array.isArray(stu.courses) && stu.courses.includes(messageToEdit.courseCode)
          );
          setFilteredStudents(filteredS);
        }
      }
    }

    fetchData();
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

    if (name === "courseCode") {
      const filteredT = tasks.filter((task) => task.courseCode === value);
      setFilteredTasks(filteredT);

      const filteredS = students.filter((stu) =>
        Array.isArray(stu.courses) && stu.courses.includes(value)
      );
      setFilteredStudents(filteredS);

      setFormData((prev) => ({
        ...prev,
        courseCode: value,
        assignmentCode: "",
        studentId: ""
      }));
    }

    if (name === "studentId") {
      setErrors((prev) => ({ ...prev, studentId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (formData.id) {
        await updateMessage(formData);
        setSnackbar({ open: true, message: "Message updated", severity: "success" });
      } else {
        if (!formData.studentId) {
          const recipients = formData.courseCode
            ? students.filter((s) =>
                Array.isArray(s.courses) && s.courses.includes(formData.courseCode)
              )
            : students;

          for (const s of recipients) {
            await addMessage({ ...formData, studentId: s.studentId });
          }
        } else {
          await addMessage(formData);
        }

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
            {filteredTasks.map((t) => (
              <MenuItem key={t.id} value={t.taskCode}>
                {t.taskCode} - {t.taskName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            name="studentId"
            label="Student (optional)"
            value={formData.studentId}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="">
              <em>All students {formData.courseCode ? "in this course" : "in the system"}</em>
            </MenuItem>
            {filteredStudents.map((s) => (
              <MenuItem key={s.id} value={s.studentId}>
                {s.studentId} - {s.fullName}
              </MenuItem>
            ))}
          </TextField>

          {formData.studentId === "" && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              This message will be sent to {formData.courseCode ? "all students in this course" : "all students in the system"}.
            </Typography>
          )}

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
