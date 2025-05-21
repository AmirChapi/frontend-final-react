import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { addTask, updateTask, isTaskCodeExists } from "../firebase/task";
import { listCourses } from "../firebase/course";

export default function TaskForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const taskToEdit = location.state?.taskToEdit || null;

  const [formData, setFormData] = useState({
    taskCode: "",
    courseCode: "",
    taskName: "",
    submissionDate: "",
    taskDescription: "",
  });

  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      const fetchedCourses = await listCourses();
      setCourses(fetchedCourses);
    }

    fetchCourses();

    if (taskToEdit) {
      setFormData(taskToEdit);
    }
  }, [taskToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let errorField = false;

    if (name === "taskCode") {
      errorField = !(value.length === 3 && /^[0-9]+$/.test(value));
    }
    if (name === "courseCode") errorField = !value;
    if (name === "taskName") errorField = !value.trim();
    if (name === "submissionDate") errorField = !value || dayjs(value).isBefore(dayjs(), "day");
    if (name === "taskDescription") errorField = !value.trim();

    setErrors((prev) => ({ ...prev, [name]: errorField }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    if (!formData.taskCode || !(formData.taskCode.length === 3 && /^[0-9]+$/.test(formData.taskCode))) {
      newErrors.taskCode = true;
      hasError = true;
    }

    if (!formData.courseCode) {
      newErrors.courseCode = true;
      hasError = true;
    }

    if (!formData.taskName.trim()) {
      newErrors.taskName = true;
      hasError = true;
    }

    if (!formData.submissionDate || dayjs(formData.submissionDate).isBefore(dayjs(), "day")) {
      newErrors.submissionDate = true;
      hasError = true;
    }

    if (!formData.taskDescription.trim()) {
      newErrors.taskDescription = true;
      hasError = true;
    }

    // בדיקת קוד מטלה קיים (רק במצב הוספה)
    if (!taskToEdit && !hasError) {
      const exists = await isTaskCodeExists(formData.taskCode);
      if (exists) {
        newErrors.taskCode = true;
        newErrors.taskCodeDuplicate = true;
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      if (taskToEdit?.id) {
        await updateTask(formData);
      } else {
        await addTask(formData);
      }

      setOpenSnackbar(true);
      setTimeout(() => navigate("/TaskManage"), 1000);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);
  const handleCancelClick = () => setOpenCancelDialog(true);
  const handleCloseCancelDialog = () => setOpenCancelDialog(false);
  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate("/TaskManage");
  };

  return (
    <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper elevation={3} sx={{ padding: 4, width: 500, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {taskToEdit ? "Edit Task" : "New Task Entry"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Task Code"
            name="taskCode"
            value={formData.taskCode}
            onChange={handleChange}
            disabled={!!taskToEdit}
            error={errors.taskCode || errors.taskCodeDuplicate}
            helperText={
              errors.taskCodeDuplicate
                ? "Task code already exists"
                : errors.taskCode
                ? "Task code must be 3 digits"
                : ""
            }
          />
          <TextField
            select
            fullWidth
            label="Course"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            error={!!errors.courseCode}
            helperText={errors.courseCode ? "Please select a course" : ""}
          >
            <MenuItem value="">
              <em>Select a course</em>
            </MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.courseCode}>
                {course.courseCode} - {course.courseName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Task Name"
            name="taskName"
            value={formData.taskName}
            onChange={handleChange}
            error={!!errors.taskName}
            helperText={errors.taskName ? "Task name is required" : ""}
          />
          <TextField
            fullWidth
            label="Submission Date"
            name="submissionDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.submissionDate}
            onChange={handleChange}
            error={!!errors.submissionDate}
            helperText={errors.submissionDate ? "Date must be today or later" : ""}
          />
          <TextField
            fullWidth
            label="Task Description"
            name="taskDescription"
            multiline
            rows={4}
            value={formData.taskDescription}
            onChange={handleChange}
            error={!!errors.taskDescription}
            helperText={errors.taskDescription ? "Task description is required" : ""}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" onClick={handleCancelClick} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={handleCloseSnackbar}>
          Task successfully saved!
        </Alert>
      </Snackbar>

      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel? Unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">No</Button>
          <Button onClick={handleConfirmCancel} color="secondary" autoFocus>Yes, Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
