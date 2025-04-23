import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Stack, // Import Stack for button layout
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // Import plugin for future date check

dayjs.extend(isSameOrAfter); // Extend dayjs with the plugin

export default function TaskForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const taskToEdit = location.state?.taskToEdit || null;

  const [formData, setFormData] = useState({
    taskCode: "",
    courseCode: "", // Store the course code (ID)
    taskName: "",
    submissionDate: "",
    taskDescription: "",
  });

  const [courses, setCourses] = useState([]);
  const [existingTaskCodes, setExistingTaskCodes] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}); // Track touched fields

  // Load courses and existing task codes from localStorage
  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
    setCourses(storedCourses);

    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    // Get existing codes, excluding the current one if editing
    const codes = storedTasks
      .filter(task => !taskToEdit || task.taskCode !== taskToEdit.taskCode)
      .map(task => task.taskCode);
    setExistingTaskCodes(codes);

  }, [taskToEdit]); // Rerun if taskToEdit changes

  // Fill form with data if editing
  useEffect(() => {
    if (taskToEdit) {
      // Ensure date is formatted correctly for the input type="date"
      const formattedTask = {
        ...taskToEdit,
        submissionDate: taskToEdit.submissionDate ? dayjs(taskToEdit.submissionDate).format('YYYY-MM-DD') : ''
      };
      setFormData(formattedTask);
      // Mark fields as touched when editing
      setTouched(Object.keys(formattedTask).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    } else {
      // Reset form when adding
      setFormData({
        taskCode: "",
        courseCode: "",
        taskName: "",
        submissionDate: "",
        taskDescription: "",
      });
      setErrors({});
      setTouched({});
    }
  }, [taskToEdit]);

  // --- Validation function for a single field ---
  const validateField = (name, value, currentFormData = formData) => {
    let errorMsg = "";
    const dataToValidate = { ...currentFormData, [name]: value };

    switch (name) {
      case "taskCode":
        if (!value) {
          errorMsg = "Task code is required.";
        } else if (!/^\d+$/.test(value)) { // Check if it contains only digits
          errorMsg = "Task code must contain only digits.";
        } else if (value.length !== 3) {
          errorMsg = "Task code must be exactly 3 digits.";
        } else if (!taskToEdit && existingTaskCodes.includes(value)) { // Check uniqueness only when adding
          errorMsg = "Task code already exists.";
        }
        break;
      case "courseCode":
        if (!value) {
          errorMsg = "Please select a course.";
        }
        break;
      case "taskName":
        if (!value.trim()) { // Check if empty after trimming whitespace
          errorMsg = "Task name is required.";
        }
        break;
      case "submissionDate":
        if (!value) {
          errorMsg = "Submission date is required.";
        // Use isSameOrAfter to allow today as a valid date
        } else if (!dayjs(value).isSameOrAfter(dayjs(), "day")) {
          errorMsg = "Submission date cannot be in the past.";
        }
        break;
      case "taskDescription":
        if (!value.trim()) {
          errorMsg = "Task description is required.";
        }
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
    return !errorMsg; // Return true if valid
  };
  // --- End Validation function ---

    // --- Validate all fields (used for submit) ---
    const validateAllFields = (dataToValidate = formData) => {
        let isValid = true;
        const newErrors = {};
        const fieldsToValidate = ['taskCode', 'courseCode', 'taskName', 'submissionDate', 'taskDescription'];

        fieldsToValidate.forEach(field => {
            // Reuse validateField logic but collect all errors
            if (!validateField(field, dataToValidate[field], dataToValidate)) {
                isValid = false;
                // Re-capture the error message set by validateField
                newErrors[field] = getValidationError(field, dataToValidate[field]); // Use helper
            }
        });

        setErrors(newErrors); // Set all errors at once
        return isValid;
    };

    // Helper to get validation message without setting state
    const getValidationError = (name, value) => {
        let errorMsg = '';
        // Simplified duplication of validation logic for immediate return
        switch (name) {
            case "taskCode":
                if (!value) errorMsg = "Task code is required.";
                else if (!/^\d+$/.test(value)) errorMsg = "Task code must contain only digits.";
                else if (value.length !== 3) errorMsg = "Task code must be exactly 3 digits.";
                else if (!taskToEdit && existingTaskCodes.includes(value)) errorMsg = "Task code already exists.";
                break;
            case "courseCode":
                if (!value) errorMsg = "Please select a course.";
                break;
            case "taskName":
                if (!value.trim()) errorMsg = "Task name is required.";
                break;
            case "submissionDate":
                if (!value) errorMsg = "Submission date is required.";
                else if (!dayjs(value).isSameOrAfter(dayjs(), "day")) errorMsg = "Submission date cannot be in the past.";
                break;
            case "taskDescription":
                if (!value.trim()) errorMsg = "Task description is required.";
                break;
            default: break;
        }
        return errorMsg;
    }
    // --- End Validate all fields ---


  const handleSubmit = (event) => {
    event.preventDefault();
    // Mark all fields as touched to show errors on submit attempt
    setTouched({ taskCode: true, courseCode: true, taskName: true, submissionDate: true, taskDescription: true });

    if (validateAllFields()) { // Validate all fields before submitting
        const existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        let updatedTasks;

        if (taskToEdit) {
            // EDIT: replace existing task
            updatedTasks = existingTasks.map((t) =>
                t.taskCode === taskToEdit.taskCode ? { ...formData } : t // Use spread for new object
            );
        } else {
            // CREATE: push new task
            updatedTasks = [...existingTasks, { ...formData }]; // Use spread for new object
        }

        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        navigate("/TaskManage"); // Navigate back
    } else {
        console.log("Validation failed on submit", errors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value); // Validate on change
    // Mark as touched on change
    if (!touched[name]) {
        setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Ensure touched state is set
    if (!touched[name]) {
        setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
    }
    // Validate on blur as well
    validateField(name, value);
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel? Unsaved changes will be lost."
    );
    if (confirmCancel) {
      navigate("/TaskManage");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "60vh", // Ensure form is vertically centered
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4, // Add padding top/bottom
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 500, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {taskToEdit ? "Edit Task" : "New Task Entry"}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate // Prevent browser default validation
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }} // Increased gap
        >
          <TextField
            required
            id="taskCode"
            name="taskCode"
            label="Task Code (3 digits)"
            // type="number" // Keep as text to allow leading zeros if needed, validation handles digits
            inputProps={{ maxLength: 3 }} // Visual length limit
            disabled={!!taskToEdit} // Disable code field when editing
            value={formData.taskCode}
            onChange={handleChange}
            onBlur={handleBlur} // Validate on blur
            error={!!errors.taskCode} // Show error state
            helperText={errors.taskCode || ''} // Show error message
            fullWidth
            // --- Use slotProps ---
            slotProps={{
              input: { 'aria-invalid': !!errors.taskCode }, // Accessibility
              helperText: {
                sx: { minHeight: '1.2em' } // Reserve space
              }
            }}
            // --- End slotProps ---
          />

          <TextField
            select
            required
            id="courseCode"
            name="courseCode"
            label="Course"
            value={formData.courseCode}
            onChange={handleChange}
            onBlur={handleBlur} // Validate on blur
            error={!!errors.courseCode} // Show error state
            helperText={errors.courseCode || ''} // Show error message
            fullWidth
            disabled={!!taskToEdit} // Optionally disable course change when editing
            // --- Use slotProps ---
            slotProps={{
              input: { 'aria-invalid': !!errors.courseCode },
              helperText: {
                sx: { minHeight: '1.2em' }
              }
            }}
            // --- End slotProps ---
          >
            <MenuItem value="" disabled>
              <em>Select a course...</em>
            </MenuItem>
            {courses.map((course) => (
              // Use courseCode as the value, assuming coursesList items have courseCode/courseName
              <MenuItem key={course.courseCode} value={course.courseCode}>
                {course.courseCode} - {course.courseName}
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
            onBlur={handleBlur} // Validate on blur
            error={!!errors.taskName} // Show error state
            helperText={errors.taskName || ''} // Show error message
            fullWidth
            // --- Use slotProps ---
            slotProps={{
              input: { 'aria-invalid': !!errors.taskName },
              helperText: {
                sx: { minHeight: '1.2em' }
              }
            }}
            // --- End slotProps ---
          />

          <TextField
            required
            id="submissionDate"
            name="submissionDate"
            label="Submission Date"
            type="date"
            value={formData.submissionDate} // Should be 'YYYY-MM-DD'
            onChange={handleChange}
            onBlur={handleBlur} // Validate on blur
            error={!!errors.submissionDate} // Show error state
            helperText={errors.submissionDate || ''} // Show error message
            fullWidth
            InputLabelProps={{ // Ensure label doesn't overlap content
              shrink: true,
            }}
            inputProps={{
                min: dayjs().format('YYYY-MM-DD') // Set min date visually in browser
            }}
            // --- Use slotProps ---
            slotProps={{
              input: { 'aria-invalid': !!errors.submissionDate },
              helperText: {
                sx: { minHeight: '1.2em' }
              }
            }}
            // --- End slotProps ---
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
            onBlur={handleBlur} // Validate on blur
            error={!!errors.taskDescription} // Show error state
            helperText={errors.taskDescription || ''} // Show error message
            fullWidth
            // --- Use slotProps ---
            slotProps={{
              input: { 'aria-invalid': !!errors.taskDescription },
              helperText: {
                sx: { minHeight: '1.2em' }
              }
            }}
            // --- End slotProps ---
          />

          {/* Buttons using Stack */}
          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              color="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {taskToEdit ? "Save Changes" : "Add Task"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
