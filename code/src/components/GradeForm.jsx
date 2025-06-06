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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { listStudent } from "../firebase/student";
import { listTasks } from "../firebase/task";
import { listGrades, addGrade, updateGrade, getGrade } from "../firebase/grade";

export default function GradeForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    idNumber: "",
    taskCode: "",
    taskGrade: "",
  });

  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [grades, setGrades] = useState([]);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const studentsData = await listStudent();
      const tasksData = await listTasks();
      const gradesData = await listGrades();

      setStudents(studentsData);
      setTasks(tasksData);
      setGrades(gradesData);

      if (id) {
        const gradeFromServer = await getGrade(id);
        if (gradeFromServer) {
          setFormData({
            id: gradeFromServer.id,
            idNumber: gradeFromServer.idNumber,
            taskCode: gradeFromServer.taskCode,
            taskGrade: gradeFromServer.taskGrade,
          });
        }
      } else {
        const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));
        if (selectedStudent) {
          setFormData((prev) => ({ ...prev, idNumber: selectedStudent.studentId }));
        }
      }
    }

    fetchData();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    const grade = Number(formData.taskGrade);

    if (!formData.idNumber) newErrors.idNumber = "Student is required";
    if (!formData.taskCode) newErrors.taskCode = "Task is required";
    if (formData.taskGrade === "" || isNaN(grade) || grade < 0 || grade > 100) {
      newErrors.taskGrade = "Grade must be a number between 0 and 100";
    }

    const student = students.find((s) => s.studentId === formData.idNumber);
    const task = tasks.find((t) => t.taskCode === formData.taskCode);
    if (student && task && !student.courses?.includes(task.courseCode)) {
      newErrors.taskCode = "Student is not enrolled in the course for this task";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const trimmedValue = name === "taskGrade" ? value.replace(/[^\d]/g, "") : value;
    setFormData((prev) => ({ ...prev, [name]: trimmedValue }));

    if (name === "taskGrade") {
      const numericValue = Number(trimmedValue);
      if (trimmedValue === "" || isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
        setErrors((prev) => ({ ...prev, taskGrade: "Grade must be a number between 0 and 100" }));
      } else {
        setErrors((prev) => ({ ...prev, taskGrade: "" }));
      }
    }
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
    setOpenCancelDialog(true);
  };

  const getFilteredTasks = () => {
    const student = students.find((s) => s.studentId === formData.idNumber);
    if (!student || !Array.isArray(student.courses)) return [];

    const usedTaskCodes = grades
      .filter((g) => g.idNumber === student.studentId && (!formData.id || g.id !== formData.id))
      .map((g) => g.taskCode);

    return tasks.filter(
      (task) =>
        student.courses.includes(task.courseCode) && !usedTaskCodes.includes(task.taskCode)
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        mt: 6,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          backgroundColor: "#ffffff",
          border: "2px solid #c0aa92",
          borderRadius: 2,
          p: 4,
          width: 400,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          {formData.id ? "Edit Grade" : "Add New Grade"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            name="idNumber"
            label="Student"
            value={formData.idNumber}
            onChange={handleChange}
            error={!!errors.idNumber}
            helperText={errors.idNumber}
            fullWidth
            disabled={!!formData.id}
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

          <TextField
            select
            name="taskCode"
            label="Task"
            value={formData.taskCode}
            onChange={handleChange}
            error={!!errors.taskCode}
            helperText={errors.taskCode}
            fullWidth
            disabled={!!formData.id}
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

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Button
              variant="contained"
              onClick={handleCancel}
              sx={{
                backgroundColor: "#bb2f13",
                color: "#f5f5f5",
                borderRadius: "20px",
                fontWeight: 400,
                textTransform: "none",
                "&:hover": {
                  color: "#000000",
                  fontWeight: 700,
                  backgroundColor: "#bb2f13",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#ebdfd1",
                color: "#000",
                borderRadius: "20px",
                fontWeight: 400,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#c0aa92",
                  fontWeight: 700,
                },
              }}
            >
              {formData.id ? "Update" : "Save"}
            </Button>
          </Box>
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

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure? Unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} color="primary">No</Button>
          <Button onClick={() => navigate("/GradeManage")} color="secondary">Yes, Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
