// CourseForm.jsx - טופס הוספת/עריכת קורס עם חיבור ל-Firestore
import React, { useState, useEffect } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { addCourse, updateCourse, listCourses } from "../firebase/course";

export default function CourseForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const courseToEdit = location.state?.courseToEdit || null;

  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    lecturer: "",
    year: "",
    semester: "",
  });
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [existingCodes, setExistingCodes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCodes = async () => {
      const courses = await listCourses();
      setExistingCodes(courses.map(c => c.courseCode));
    };
    fetchCodes();

    if (courseToEdit) {
      setFormData({ ...courseToEdit });
    }
  }, [courseToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const currentYear = new Date().getFullYear();
    let hasError = false;

    if (name === 'courseCode') {
      hasError = !(value.length === 3 && /^[0-9]+$/.test(value));
    }
    if (name === 'courseName' || name === 'lecturer') {
      hasError = !value.trim();
    }
    if (name === 'year') {
      const y = parseInt(value);
      hasError = !(value.length === 4 && y > 2000 && y <= currentYear);
    }
    if (name === 'semester') {
      hasError = !value.trim();
    }

    setErrors(prev => ({ ...prev, [name]: hasError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.year);
    const newErrors = {};
    let hasError = false;

    if (!(formData.courseCode.length === 3 && /^[0-9]+$/.test(formData.courseCode))) {
      newErrors.courseCode = true;
      hasError = true;
    }
    if (!formData.courseName.trim()) {
      newErrors.courseName = true;
      hasError = true;
    }
    if (!formData.lecturer.trim()) {
      newErrors.lecturer = true;
      hasError = true;
    }
    if (!(formData.year.length === 4 && year > 2000 && year <= currentYear)) {
      newErrors.year = true;
      hasError = true;
    }
    if (!formData.semester.trim()) {
      newErrors.semester = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      if (courseToEdit) {
        await updateCourse(formData);
      } else {
        if (existingCodes.includes(formData.courseCode)) {
          setError("This course already exists.");
          return;
        }
        await addCourse({ ...formData, assignedStudents: [] });
      }

      setOpenSnackbar(true);
      setTimeout(() => navigate("/CoursesManage"), 1000);
    } catch (err) {
      setError("Error saving course");
    }
  };

  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {courseToEdit ? 'Edit Course' : 'Add New Course'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            label="Course Code"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            fullWidth
            disabled={!!courseToEdit}
            error={errors.courseCode}
            helperText={errors.courseCode ? 'Must be a 3-digit number' : ''}
          />

          <TextField
            required
            label="Course Name"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            fullWidth
            error={errors.courseName}
            helperText={errors.courseName ? 'Required field' : ''}
          />

          <TextField
            required
            label="Lecturer"
            name="lecturer"
            value={formData.lecturer}
            onChange={handleChange}
            fullWidth
            error={errors.lecturer}
            helperText={errors.lecturer ? 'Required field' : ''}
          />



          <TextField
            required
            label="Semester"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            fullWidth
            select
            error={errors.semester}
            helperText={errors.semester ? 'Required field' : ''}
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
          </TextField>

          <TextField
            required
            label="Year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            fullWidth
            error={errors.year}
            helperText={errors.year ? 'Year must be after 2000 and valid' : ''}
          />

          {error && (
            <Typography color="error" fontSize="0.9rem">
              {error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => setOpenCancelDialog(true)} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={() => setOpenSnackbar(false)}>
          Course successfully saved!
        </Alert>
      </Snackbar>

      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel? Unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} color="primary">No</Button>
          <Button onClick={() => navigate("/CoursesManage")} color="secondary" autoFocus>Yes, Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
