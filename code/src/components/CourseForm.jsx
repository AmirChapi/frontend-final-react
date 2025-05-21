// CourseForm.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { addCourse, updateCourse } from "../firebase/course";

export default function CourseForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const courseToEdit = location.state?.courseToEdit || null;

  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    lecturer: "",
    semester: "",
    year: "",
  });

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (courseToEdit) {
      setFormData(courseToEdit);
    }
  }, [courseToEdit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.courseCode) newErrors.courseCode = "Required";
    if (!formData.courseName) newErrors.courseName = "Required";
    if (!formData.lecturer) newErrors.lecturer = "Required";
    if (!formData.semester) newErrors.semester = "Required";
    if (!formData.year || isNaN(formData.year)) newErrors.year = "Year must be a number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (formData.id) {
        await updateCourse(formData);
        setSnackbar({ open: true, message: "Course updated successfully", severity: "success" });
      } else {
        await addCourse(formData);
        setSnackbar({ open: true, message: "Course added successfully", severity: "success" });
      }
      setTimeout(() => navigate("/courses"), 1000);
    } catch (err) {
      console.error("Error saving course:", err);
      setSnackbar({ open: true, message: "Error saving course", severity: "error" });
    }
  };

  return (
    <Box component={Paper} p={3} maxWidth={600} mx="auto" mt={4}>
      <Typography variant="h5" gutterBottom>
        {courseToEdit ? "Edit Course" : "Add Course"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="courseCode"
          label="Course Code"
          value={formData.courseCode}
          onChange={handleChange}
          error={!!errors.courseCode}
          helperText={errors.courseCode}
          fullWidth
          margin="normal"
          disabled={!!formData.id} // מניעת שינוי קוד בקורס קיים
        />
        <TextField
          name="courseName"
          label="Course Name"
          value={formData.courseName}
          onChange={handleChange}
          error={!!errors.courseName}
          helperText={errors.courseName}
          fullWidth
          margin="normal"
        />
        <TextField
          name="lecturer"
          label="Lecturer"
          value={formData.lecturer}
          onChange={handleChange}
          error={!!errors.lecturer}
          helperText={errors.lecturer}
          fullWidth
          margin="normal"
        />
        <TextField
          name="semester"
          label="Semester"
          value={formData.semester}
          onChange={handleChange}
          error={!!errors.semester}
          helperText={errors.semester}
          fullWidth
          margin="normal"
        />
        <TextField
          name="year"
          label="Year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          error={!!errors.year}
          helperText={errors.year}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          {courseToEdit ? "Update Course" : "Add Course"}
        </Button>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
