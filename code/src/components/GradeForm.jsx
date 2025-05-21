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
import { useNavigate, useLocation } from "react-router-dom";import {
  addGrade,
  updateGrade,
  listGrades,
  getGrade
} from "../firebase/grade";

export default function GradeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const gradeToEdit = location.state?.gradeToEdit || null;

  const initialValues = {
    idNumber: "",
    taskCode: "",
    taskGrade: "",
  };

  const [formData, setFormData] = useState(initialValues);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  // ניגש ל-Firestore ומביא את הנתונים
  useEffect(() => {
    const fetchGrades = async () => {
      const fetchedGrades = await listGrades();
      setGrades(fetchedGrades);
    };

    const fetchStudentsAndTasks = async () => {
      // יש להוסיף פונקציות Firebase המתאימות כדי למשוך את רשימות הסטודנטים והמטלות
      const fetchedStudents = await listStudents(); // פונקציה שמשיגה את כל הסטודנטים
      const fetchedTasks = await listTasks(); // פונקציה שמשיגה את כל המטלות
      setStudents(fetchedStudents);
      setTasks(fetchedTasks);
    };

    fetchGrades();
    fetchStudentsAndTasks();

    if (gradeToEdit) {
      setFormData({ ...gradeToEdit });
    }
  }, [gradeToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    let errorField = false;
    const grade = Number(value);

    if (name === "taskGrade") {
      errorField = value === "" || isNaN(grade) || grade < 0 || grade > 100;
    } else {
      errorField = !value;
    }

    setErrors(prev => ({ ...prev, [name]: errorField }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    const grade = Number(formData.taskGrade);
    if (formData.taskGrade === "" || isNaN(grade) || grade < 0 || grade > 100) {
      newErrors.taskGrade = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // בדיקה אם הסטודנט משוייך למטלה
    const student = students.find(s => s.studentId === formData.idNumber);
    const task = tasks.find(t => t.taskCode === formData.taskCode);
    if (student && task && !(student.courses || []).includes(task.courseCode)) {
      setError("This student is not assigned to the course of this task.");
      return;
    }

    if (gradeToEdit) {
      // עדכון ציון
      await updateGrade(formData);
    } else {
      // יצירת ציון חדש
      await addGrade(formData);
    }

    setOpenSnackbar(true);
    setTimeout(() => navigate("/GradeManage"), 1000);
  };

  const handleCancelClick = () => {
    setOpenCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate("/GradeManage");
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  return (
    <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {gradeToEdit ? "Edit Grade" : "Add New Grade"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Student ID"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            fullWidth
            disabled={!!gradeToEdit}
            error={errors.idNumber}
            helperText={errors.idNumber ? "Student is required" : ""}
          >
            {students.map((student) => (
              <MenuItem key={student.studentId} value={student.studentId}>
                {student.studentId} - {student.fullName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Task"
            name="taskCode"
            value={formData.taskCode}
            onChange={handleChange}
            fullWidth
            disabled={!!gradeToEdit}
            error={errors.taskCode}
            helperText={errors.taskCode ? "Task is required" : ""}
          >
            {tasks.map((task) => (
              <MenuItem key={task.taskCode} value={task.taskCode}>
                {task.taskCode} - {task.taskName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Grade (0-100)"
            name="taskGrade"
            type="number"
            value={formData.taskGrade}
            onChange={handleChange}
            fullWidth
            error={errors.taskGrade}
            helperText={errors.taskGrade ? "Enter a valid grade between 0-100" : ""}
          />

          {error && (
            <Typography color="error" fontSize="0.9rem">
              {error}
            </Typography>
          )}

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

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: "100%" }}>
          Grade saved successfully!
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
          <Button onClick={handleCloseCancelDialog}>No</Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
