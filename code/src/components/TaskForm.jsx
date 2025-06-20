import React from "react";
import {
  useState,
  useEffect,
} from "react";
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
  DialogTitle,
} from "@mui/material";
import { useNavigate, useParams} from "react-router-dom";
import dayjs from "dayjs";
import {
  addTask,
  updateTask,
  isTaskCodeExists,
  getTaskById,
} from "../firebase/task";
import { listCourses } from "../firebase/course";

export default function TaskForm() {
  const navigate = useNavigate();
  const { id } = useParams();

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
    const fetchData = async () => {
      const fetchedCourses = await listCourses();
      setCourses(fetchedCourses);

      if (id) {
        const existingTask = await getTaskById(id);
        if (existingTask) {
          setFormData(existingTask);
        }
      }
    };
    fetchData();
  }, [id]);

  const validateField = async (name, value) => {
    let error = false;
    let duplicate = false;

    if (name === "taskCode") {
      error = !/^\d{3}$/.test(value); // בדיוק 3 ספרות
      if (!id && !error && value) {
        const exists = await isTaskCodeExists(value);
        duplicate = exists;
      }
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

    setErrors((prev) => ({
      ...prev,
      [name]: error,
      ...(name === "taskCode" ? { taskCodeDuplicate: duplicate } : {}),
    }));

    return error || duplicate;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    await validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fields = [
      "taskCode",
      "courseCode",
      "taskName",
      "submissionDate",
      "taskDescription",
    ];

    let hasError = false;
    const newErrors = {};

    for (const field of fields) {
      const value = formData[field];
      const error = await validateField(field, value);
      if (error) hasError = true;
    }

    if (hasError || Object.values(errors).some((e) => e)) return;

    if (id) {
      await updateTask({ ...formData, id });
    } else {
      await addTask(formData);
    }

    setOpenSnackbar(true);
    setTimeout(() => navigate("/TaskManage"), 1000);
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
          {id ? "Edit Task" : "Add New Task"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Task Code"
            name="taskCode"
            value={formData.taskCode}
            onChange={handleChange}
            disabled={!!id}
            error={!!errors.taskCode || !!errors.taskCodeDuplicate}
            helperText={
              errors.taskCodeDuplicate
                ? "Task code already exists"
                : errors.taskCode
                ? "Task code must be exactly 3 digits"
                : ""
            }
          />

          <TextField
            select
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
            label="Task Name"
            name="taskName"
            value={formData.taskName}
            onChange={handleChange}
            error={!!errors.taskName}
            helperText={errors.taskName ? "Task name is required" : ""}
          />

          <TextField
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
            label="Task Description"
            name="taskDescription"
            multiline
            rows={4}
            value={formData.taskDescription}
            onChange={handleChange}
            error={!!errors.taskDescription}
            helperText={errors.taskDescription ? "Task description is required" : ""}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Button
              variant="contained"
              onClick={() => setOpenCancelDialog(true)}
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
              {formData.id ? "Update" : "Save"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: "100%" }} onClose={() => setOpenSnackbar(false)}>
          Task successfully saved!
        </Alert>
      </Snackbar>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure? Unsaved changes will be lost.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} color="primary">No</Button>
          <Button onClick={() => navigate('/TaskManage')} color="secondary">Yes, Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

