import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import { listStudent } from "../firebase/student";
import { listTasks } from "../firebase/task";
import { addGrade, updateGrade } from "../firebase/grade";

export default function GradeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const gradeToEdit = location.state?.gradeToEdit || null;

  const [formData, setFormData] = useState({
    idNumber: "",
    taskCode: "",
    taskGrade: "",
  });

  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    async function fetchData() {
      const studentsData = await listStudent();
      const tasksData = await listTasks();
      setStudents(studentsData);
      setTasks(tasksData);
    }

    fetchData();

    if (gradeToEdit) {
      setFormData(gradeToEdit);
    }
  }, [gradeToEdit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.idNumber) newErrors.idNumber = "Student is required";
    if (!formData.taskCode) newErrors.taskCode = "Task is required";
    if (formData.taskGrade === "" || isNaN(formData.taskGrade)) {
      newErrors.taskGrade = "Grade must be a number";
    }

    // בדיקת התאמה בין סטודנט לקורס של המטלה
    const student = students.find(s => s.studentId === formData.idNumber);
    const task = tasks.find(t => t.taskCode === formData.taskCode);
    if (student && task && !student.courses?.includes(task.courseCode)) {
      newErrors.taskCode = "Student is not enrolled in the course for this task";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "taskGrade" ? value.replace(/[^\d]/g, "") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (formData.id) {
        await updateGrade(formData);
        setSnackbar({ open: true, message: "Grade updated successfully", severity: "success" });
      } else {
        await addGrade(formData);
        setSnackbar({ open: true, message: "Grade added successfully", severity: "success" });
      }

      setTimeout(() => navigate("/GradeManage"), 1000);
    } catch (err) {
      console.error("Error saving grade:", err);
      setSnackbar({ open: true, message: "Error saving grade", severity: "error" });
    }
  };

  const handleCancel = () => {
    navigate("/GradeManage");
  };

  // ✅ הצגת רק מטלות שרלוונטיות לסטודנט הנבחר
  const getFilteredTasks = () => {
    const student = students.find(s => s.studentId === formData.idNumber);
    if (!student || !Array.isArray(student.courses)) return [];
    return tasks.filter(task => student.courses.includes(task.courseCode));
  };

  return (
    <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper elevation={3} sx={{ padding: 4, width: 500, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {gradeToEdit ? "Edit Grade" : "Add New Grade"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* בחירת סטודנט */}
          <TextField
            select
            name="idNumber"
            label="Student"
            value={formData.idNumber}
            onChange={handleChange}
            error={!!errors.idNumber}
            helperText={errors.idNumber}
            fullWidth
          >
            <MenuItem value="">
              <em>Select a student</em>
            </MenuItem>
            {students.map((s) => (
              <MenuItem key={s.id} value={s.studentId}>
                {s.studentId} - {s.fullName}
              </MenuItem>
            ))}
          </TextField>

          {/* בחירת מטלה מתאימה לקורסים של הסטודנט */}
          <TextField
            select
            name="taskCode"
            label="Task"
            value={formData.taskCode}
            onChange={handleChange}
            error={!!errors.taskCode}
            helperText={errors.taskCode}
            fullWidth
          >
            <MenuItem value="">
              <em>Select a task</em>
            </MenuItem>
            {getFilteredTasks().map((t) => (
              <MenuItem key={t.id} value={t.taskCode}>
                {t.taskCode} - {t.taskName}
              </MenuItem>
            ))}
          </TextField>

          {/* ציון */}
          <TextField
            name="taskGrade"
            label="Grade"
            type="number"
            value={formData.taskGrade}
            onChange={handleChange}
            error={!!errors.taskGrade}
            helperText={errors.taskGrade}
            fullWidth
          />

          <Stack direction="row" spacing={2} mt={2}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {formData.id ? "Update" : "Save"}
            </Button>
            <Button variant="outlined" color="secondary" fullWidth onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
