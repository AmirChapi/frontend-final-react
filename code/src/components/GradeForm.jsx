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

export default function GradeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const gradeToEdit = location.state?.gradeToEdit || null;

  const [formData, setFormData] = useState({
    idNumber: "",
    taskGrade: "",
    taskName: "",
  });

  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setStudents(storedStudents);
    setTasks(storedTasks);
  }, []);

  useEffect(() => {
    if (gradeToEdit) {
      setFormData(gradeToEdit);
    }
  }, [gradeToEdit]);

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "taskGrade") {
      const num = Number(value);
      if (!value) errorMsg = "Grade is required.";
      else if (isNaN(num) || num < 0 || num > 100) {
        errorMsg = "Grade must be a number between 0 and 100.";
      }
    } else if (name === "idNumber") {
      if (!value) errorMsg = "Student ID is required.";
    } else if (name === "taskName") {
      if (!value) errorMsg = "Task Name is required.";
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      validateField(name, value);
    }
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let hasErrors = false;
    Object.entries(formData).forEach(([key, value]) => {
      validateField(key, value);
      if (!value || errors[key]) {
        hasErrors = true;
      }
    });

    if (hasErrors) return;

    const existingGrades = JSON.parse(localStorage.getItem("grades")) || [];

    const isDuplicate = existingGrades.some(
      (g) =>
        g.idNumber === formData.idNumber &&
        g.taskName === formData.taskName &&
        (!gradeToEdit ||
          (g.idNumber !== gradeToEdit.idNumber ||
            g.taskName !== gradeToEdit.taskName))
    );

    if (isDuplicate) {
      setError("This student already has a grade for this task.");
      return;
    }

    let updatedGrades;
    if (gradeToEdit) {
      updatedGrades = existingGrades.map((g) =>
        g.idNumber === gradeToEdit.idNumber &&
        g.taskName === gradeToEdit.taskName
          ? formData
          : g
      );
    } else {
      updatedGrades = [...existingGrades, formData];
    }

    localStorage.setItem("grades", JSON.stringify(updatedGrades));
    navigate("/GradeManage");
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
          {gradeToEdit ? "Edit Grade" : "New Grade Entry"}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            select
            required
            id="idNumber"
            name="idNumber"
            label="Student ID"
            value={formData.idNumber}
            onChange={handleChange}
            onBlur={() => validateField("idNumber", formData.idNumber)}
            fullWidth
            disabled={!!gradeToEdit}
            error={Boolean(errors.idNumber)}
            helperText={errors.idNumber}
            slotProps={{
              input: { 'aria-invalid': Boolean(errors.idNumber) },
              helperText: {
                sx: {
                  color: errors.idNumber ? 'error.main' : 'text.secondary',
                },
              },
            }}
          >
            {students.map((student) => (
              <MenuItem key={student.studentId} value={student.studentId}>
                {student.studentId} - {student.fullName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            required
            id="taskGrade"
            name="taskGrade"
            label="Task Grade"
            type="number"
            value={formData.taskGrade}
            onChange={handleChange}
            onBlur={() => validateField("taskGrade", formData.taskGrade)}
            fullWidth
            error={Boolean(errors.taskGrade)}
            helperText={errors.taskGrade}
            slotProps={{
              input: { 'aria-invalid': Boolean(errors.taskGrade) },
              helperText: {
                sx: {
                  color: errors.taskGrade ? 'error.main' : 'text.secondary',
                },
              },
            }}
          />

          <TextField
            select
            required
            id="taskName"
            name="taskName"
            label="Task Name"
            value={formData.taskName}
            onChange={handleChange}
            onBlur={() => validateField("taskName", formData.taskName)}
            fullWidth
            disabled={!!gradeToEdit}
            error={Boolean(errors.taskName)}
            helperText={errors.taskName}
            slotProps={{
              input: { 'aria-invalid': Boolean(errors.taskName) },
              helperText: {
                sx: {
                  color: errors.taskName ? 'error.main' : 'text.secondary',
                },
              },
            }}
          >
            {tasks.map((task) => (
              <MenuItem key={task.taskName} value={task.taskName}>
                {task.taskName}
              </MenuItem>
            ))}
          </TextField>

          {error && (
            <Typography color="error" fontSize="0.9rem">
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={() => {
                const confirmCancel = window.confirm(
                  "Are you sure you want to cancel? Unsaved changes will be lost."
                );
                if (confirmCancel) navigate("/GradeManage");
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
