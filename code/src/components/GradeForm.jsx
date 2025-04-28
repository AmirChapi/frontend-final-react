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
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function GradeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const gradeToEdit = location.state?.gradeToEdit || null;

  const initialValues = {
    idNumber: "",
    taskCode: "",
    taskGrade: "",
    taskName: "",
  };

  const [formData, setFormData] = useState(initialValues);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setStudents(storedStudents);
    setTasks(storedTasks);
    if (gradeToEdit) {
      setFormData({ ...gradeToEdit });
    }
  }, [gradeToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let newFormData = { ...formData, [name]: value };

    // When taskName changes, update taskCode automatically
    if (name === "taskName") {
      const selectedTask = tasks.find(task => task.taskName === value);
      if (selectedTask) {
        newFormData.taskCode = selectedTask.taskCode || "";
      } else {
        newFormData.taskCode = "";
      }
    }

    setFormData(newFormData);

    let errorField = false;

    if (name === "taskGrade") {
      const num = Number(value);
      errorField = !(value && !isNaN(num) && num >= 0 && num <= 100);
    }

    if (name === "idNumber") {
      errorField = !value;
    }

    if (name === "taskName") {
      errorField = !value;
    }

    setErrors((prev) => ({ ...prev, [name]: errorField }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingGrades = JSON.parse(localStorage.getItem("grades")) || [];

    const isDuplicate = existingGrades.some(
      (g) =>
        g.idNumber === formData.idNumber &&
        g.taskName === formData.taskName &&
        (!gradeToEdit ||
          g.idNumber !== gradeToEdit.idNumber ||
          g.taskName !== gradeToEdit.taskName)
    );

    if (isDuplicate) {
      setError("This student already has a grade for this task.");
      return;
    }

    const updatedGrades = gradeToEdit
      ? existingGrades.map((g) =>
          g.idNumber === gradeToEdit.idNumber && g.taskName === gradeToEdit.taskName
            ? formData
            : g
        )
      : [...existingGrades, formData];

    localStorage.setItem("grades", JSON.stringify(updatedGrades));
    setOpenSnackbar(true);
    setTimeout(() => navigate("/GradeManage"), 1000);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {gradeToEdit ? "Edit Grade" : "New Grade Entry"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            required
            id="idNumber"
            name="idNumber"
            label="Student ID"
            value={formData.idNumber}
            onChange={handleChange}
            fullWidth
            disabled={!!gradeToEdit}
            error={errors.idNumber}
            helperText={errors.idNumber ? "Student ID is required" : ""}
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
            fullWidth
            error={errors.taskGrade}
            helperText={errors.taskGrade ? "Grade must be a number between 0 and 100" : ""}
          />

          <TextField
            select
            required
            id="taskName"
            name="taskName"
            label="Task Name"
            value={formData.taskName}
            onChange={handleChange}
            fullWidth
            disabled={!!gradeToEdit}
            error={errors.taskName}
            helperText={errors.taskName ? "Task name is required" : ""}
          >
            {tasks.map((task) => (
              <MenuItem key={task.taskName} value={task.taskName}>
                {task.taskName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            required
            id="taskCode"
            name="taskCode"
            label="Task Code"
            value={formData.taskCode}
            fullWidth
            disabled
            helperText="Task code is selected automatically"
          />

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
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={handleCloseSnackbar}>
          Grade successfully saved!
        </Alert>
      </Snackbar>
    </Box>
  );
}
