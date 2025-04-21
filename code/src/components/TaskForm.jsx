import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

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

  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});

  // Load courses from localStorage
  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
    setCourses(storedCourses);
  }, []);

  // Fill form with data if editing
  useEffect(() => {
    if (taskToEdit) {
      setFormData(taskToEdit);
    }
  }, [taskToEdit]);

  const validate = () => {
    const errs = {};
    const taskCodeNum = Number(formData.taskCode);
    const existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // Task Code: 3-digit positive number and unique (only if creating)
    if (!/^\d{3}$/.test(formData.taskCode)) {
      errs.taskCode = "Must be a 3-digit number";
    } else if (
      !taskToEdit &&
      existingTasks.some((t) => t.taskCode === formData.taskCode)
    ) {
      errs.taskCode = "Task code already exists";
    }

    // Submission Date: must be in the future
    if (!formData.submissionDate) {
      errs.submissionDate = "Submission date is required";
    } else if (dayjs(formData.submissionDate).isBefore(dayjs(), "day")) {
      errs.submissionDate = "Date must be in the future";
    }

    return errs;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (taskToEdit) {
      // EDIT: replace existing task
      const updatedTasks = existingTasks.map((t) =>
        t.taskCode === taskToEdit.taskCode ? formData : t
      );
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } else {
      // CREATE: push new task
      existingTasks.push(formData);
      localStorage.setItem("tasks", JSON.stringify(existingTasks));
    }

    navigate("/TaskManage");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {taskToEdit ? "Edit Task" : "New Task Entry"}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            required
            id="taskCode"
            name="taskCode"
            label="Task Code"
            type="number"
            inputProps={{ min: 100, max: 999 }}
            disabled={!!taskToEdit}
            value={formData.taskCode}
            onChange={handleChange}
            error={!!errors.taskCode}
            helperText={errors.taskCode}
            fullWidth
          />

          <TextField
            select
            required
            id="courseCode"
            name="courseCode"
            label="Course Code"
            value={formData.courseCode}
            onChange={handleChange}
            fullWidth
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.id} - {course.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            required
            id="taskName"
            name="taskName"
            label="Task Name"
            value={formData.taskName}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            required
            id="submissionDate"
            name="submissionDate"
            label="Submission Date"
            type="date"
            value={formData.submissionDate}
            onChange={handleChange}
            error={!!errors.submissionDate}
            helperText={errors.submissionDate}
            fullWidth
          />

          <TextField
            required
            id="taskDescription"
            name="taskDescription"
            label="Task Description"
            multiline
            rows={4}
            value={formData.taskDescription}
            onChange={handleChange}
            fullWidth
          />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            onClick={() => {
            const confirmCancel = window.confirm(
              "Are you sure you want to cancel? Unsaved changes will be lost."
            );
            if (confirmCancel) {
              navigate("/TaskManage");
            }
          }}
        >
          Cancel
          </Button>

            <Button type="submit" variant="contained">
              Save
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
