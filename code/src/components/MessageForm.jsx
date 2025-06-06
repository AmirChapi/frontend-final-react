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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { listCourses } from "../firebase/course";
import { listTasks } from "../firebase/task";
import { listStudent } from "../firebase/student";
import { addMessage, updateMessage, getMessage } from "../firebase/message";

export default function MessageForm() {
  const navigate = useNavigate();
  const { id } = useParams();

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
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

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

      if (id) {
        const message = await getMessage(id);
        if (message) {
          setFormData(message);
          setFilteredTasks(t.filter((task) => task.courseCode === message.courseCode));
          setFilteredStudents(s.filter((stu) => Array.isArray(stu.courses) && stu.courses.includes(message.courseCode)));
        }
      } else {
        setFilteredTasks(t);
        setFilteredStudents(s);
      }
    }

    fetchData();
  }, [id]);

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
      setFilteredTasks(tasks.filter((task) => task.courseCode === value));
      setFilteredStudents(students.filter((stu) => Array.isArray(stu.courses) && stu.courses.includes(value)));
      setFormData((prev) => ({
        ...prev,
        courseCode: value,
        assignmentCode: "",
        studentId: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (id) {
        await updateMessage({ ...formData, id });
        setSnackbar({ open: true, message: "Message updated", severity: "success" });
      } else {
        if (!formData.studentId) {
          const recipients = formData.courseCode
            ? students.filter((s) => Array.isArray(s.courses) && s.courses.includes(formData.courseCode))
            : students;
          for (const s of recipients) {
            await addMessage({ ...formData, studentId: s.studentId });
          }
        } else {
          await addMessage(formData);
        }

        setSnackbar({ open: true, message: "Message added", severity: "success" });
      }

      setTimeout(() => navigate("/MessageManage"), 1000);
    } catch {
      setSnackbar({ open: true, message: "Error saving message", severity: "error" });
    }
  };

  const handleCancel = () => {
    setOpenCancelDialog(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        mt: 6,
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          backgroundColor: '#ffffff',
          border: '2px solid #c0aa92',
          borderRadius: 2,
          p: 4,
          width: 400,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          {id ? "Edit Message" : "Add Message"}
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleCancel}
              sx={{
                backgroundColor: '#bb2f13',
                color: '#f5f5f5',
                borderRadius: '20px',
                fontWeight: 400,
                textTransform: 'none',
                '&:hover': {
                  color: '#000000',
                  fontWeight: 700,
                  backgroundColor: '#bb2f13',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#ebdfd1',
                color: '#000',
                borderRadius: '20px',
                fontWeight: 400,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#c0aa92',
                  fontWeight: 700,
                },
              }}
            >
              {id ? "Update" : "Save"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure? Unsaved changes will be lost.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} color="primary">No</Button>
          <Button onClick={() => navigate("/MessageManage")} color="secondary">Yes, Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
