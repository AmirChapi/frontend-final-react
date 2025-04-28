import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Stack,
  Snackbar,
  Alert
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

export default function TaskForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const taskToEdit = location.state?.taskToEdit || null;

  const initialValues = {
    taskCode: "",
    courseCode: "",
    taskName: "",
    submissionDate: "",
    taskDescription: "",
  };

  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
    setCourses(storedCourses);
    if (taskToEdit) {
      setFormData({ ...taskToEdit });
    }
  }, [taskToEdit]);

  const handleChange = (event) => {
    const { name, value} = event.target;
    setFormData({ ...formData, [name]: value });

    let error = false;

    if (name === "taskCode") {
      error = !(value.length === 3 && !isNaN(value));
    }

    if (name === "courseCode") {
      error = !value;
    }

    if (name === "taskName") {
      error = !value.trim();
    }

    if (name === "submissionDate") {
      error = !value || dayjs(value).isBefore(dayjs(), "day");
    }

    if (name === "taskDescription") {
      error = !value.trim();
    }

    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const storedTasks = localStorage.getItem("tasks");
    const existingTasks = storedTasks ? JSON.parse(storedTasks) : [];

    const updatedTasks = taskToEdit ? existingTasks.map((t) =>
          t.taskCode === taskToEdit.taskCode ? formData : t
        )
      : [...existingTasks, formData];

    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    setOpenSnackbar(true);
    setTimeout(() => navigate("/TaskManage"), 1000);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Paper sx={{ p: 4, width: 500 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {taskToEdit ? "Edit Task" : "New Task Entry"}
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            required
            label="Task Code"
            name="taskCode"
            value={formData.taskCode}
            onChange={handleChange}
            error={errors.taskCode}
            helperText={errors.taskCode ? "Task code must be 3 digits" : ""}
            margin="normal"
          />
          <TextField
            select
            fullWidth
            required
            label="Course"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            error={errors.courseCode}
            helperText={errors.courseCode ? "Please select a course" : ""}
            margin="normal"
          >
            <MenuItem value="">
              <em>Select a course</em>
            </MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.courseCode} value={course.courseCode}>
                {course.courseCode} - {course.courseName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            required
            label="Task Name"
            name="taskName"
            value={formData.taskName}
            onChange={handleChange}
            error={errors.taskName}
            helperText={errors.taskName ? "Task name is required" : ""}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            label="Submission Date"
            name="submissionDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.submissionDate}
            onChange={handleChange}
            error={errors.submissionDate}
            helperText={errors.submissionDate ? "Date must be today or later" : ""}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            label="Task Description"
            name="taskDescription"
            multiline
            rows={4}
            value={formData.taskDescription}
            onChange={handleChange}
            error={errors.taskDescription}
            helperText={errors.taskDescription ? "Task description is required" : ""}
            margin="normal"
          />
          <Stack direction="row" spacing={2} justifyContent="space-between" mt={2}>
            <Button variant="outlined" color="secondary" onClick={() => navigate("/TaskManage")}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {taskToEdit ? "Save Changes" : "Add Task"}
            </Button>
          </Stack>
        </form>
      </Paper>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={handleCloseSnackbar}>
          Task successfully saved!
        </Alert>
      </Snackbar>
    </Box>
  );
}
