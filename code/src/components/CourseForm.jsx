import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addCourse,
  updateCourse,
  isCourseCodeExists,
} from "../firebase/course";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (courseToEdit) {
      setFormData(courseToEdit);
    }
  }, [courseToEdit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.courseCode.trim()) newErrors.courseCode = "Course code is required";
    if (!formData.courseName.trim()) newErrors.courseName = "Course name is required";
    if (!formData.lecturer.trim()) newErrors.lecturer = "Lecturer is required";
    if (!formData.semester.trim()) newErrors.semester = "Semester is required";
    if (!formData.year || isNaN(formData.year)) newErrors.year = "Year must be a number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (!formData.id) {
        const exists = await isCourseCodeExists(formData.courseCode);
        if (exists) {
          setErrors((prev) => ({
            ...prev,
            courseCode: "Course code already exists",
          }));
          return;
        }
        await addCourse(formData);
        setSnackbar({
          open: true,
          message: "Course added successfully",
          severity: "success",
        });
      } else {
        await updateCourse(formData);
        setSnackbar({
          open: true,
          message: "Course updated successfully",
          severity: "success",
        });
      }

      setTimeout(() => navigate("/coursesManage"), 1000);
    } catch (error) {
      console.error("Error saving course:", error);
      setSnackbar({
        open: true,
        message: "Error saving course",
        severity: "error",
      });
    }
  };

  const handleCancel = () => {
    navigate("/coursesManage");
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
          disabled={!!formData.id} // למנוע שינוי קוד בקורס קיים
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

        <Stack direction="row" spacing={2} mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {formData.id ? "Update Course" : "Add Course"}
          </Button>
          <Button onClick={handleCancel} variant="outlined" color="secondary" fullWidth>
            Cancel
          </Button>
        </Stack>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

