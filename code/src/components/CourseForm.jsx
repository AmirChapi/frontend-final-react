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
  const [error, setError] = useState("");

  useEffect(() => {
    if (courseToEdit) {
      setFormData(courseToEdit);
    }
  }, [courseToEdit]);

  const validateField = (name, value) => {
    let errorMsg = "";
    switch (name) {
      case "courseCode":
        if (!value) errorMsg = "Course code is required.";
        else if (!/^[0-9]+$/.test(value)) errorMsg = "Course code must contain digits only.";
        else if (value.length !== 3) errorMsg = "Course code must be exactly 3 digits.";
        else if (parseInt(value) <= 0) errorMsg = "Course code must be a positive number.";
        break;
      case "courseName":
        if (!value) errorMsg = "Course name is required.";
        else if (/\d/.test(value)) errorMsg = "Course name must not contain numbers.";
        break;
      case "lecturer":
        if (!value) errorMsg = "Lecturer is required.";
        break;
      case "year":
        if (!value) errorMsg = "Year is required.";
        else if (!/^\d{4}$/.test(value)) errorMsg = "Enter a valid 4-digit year.";
        else if (parseInt(value) <= 2000) errorMsg = "Year must be greater than 2000.";
        break;
      case "semester":
        if (!value) errorMsg = "Semester is required.";
        break;
      default:
        break;
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

    const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
    const isDuplicate = !courseToEdit && storedCourses.some(
      (course) => course.courseCode === formData.courseCode
    );

    if (isDuplicate) {
      setError("This course already exists.");
      return;
    }

    let updatedCourses;
    if (courseToEdit) {
      updatedCourses = storedCourses.map((course) =>
        course.courseCode === courseToEdit.courseCode ? formData : course
      );
    } else {
      updatedCourses = [...storedCourses, formData];
    }

    localStorage.setItem("coursesList", JSON.stringify(updatedCourses));
    navigate("/CoursesManage");
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
          {courseToEdit ? "Edit Course" : "Add new Course"}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            required
            id="courseCode"
            name="courseCode"
            label="Course Code"
            value={formData.courseCode}
            onChange={handleChange}
            onBlur={() => validateField("courseCode", formData.courseCode)}
            fullWidth
            disabled={!!courseToEdit}
            error={Boolean(errors.courseCode)}
            helperText={errors.courseCode}
            slotProps={{
              input: { 'aria-invalid': Boolean(errors.courseCode) },
              helperText: {
                sx: {
                  color: errors.courseCode ? 'error.main' : 'text.secondary',
                },
              },
            }}
          />

          <TextField
            required
            id="courseName"
            name="courseName"
            label="Course Name"
            value={formData.courseName}
            onChange={handleChange}
            onBlur={() => validateField("courseName", formData.courseName)}
            fullWidth
            error={Boolean(errors.courseName)}
            helperText={errors.courseName}
            slotProps={{
              input: { 'aria-invalid': Boolean(errors.courseName) },
              helperText: {
                sx: {
                  color: errors.courseName ? 'error.main' : 'text.secondary',
                },
              },
            }}
          />

          <TextField
            required
            id="lecturer"
            name="lecturer"
            label="Lecturer"
            value={formData.lecturer}
            onChange={handleChange}
            onBlur={() => validateField("lecturer", formData.lecturer)}
            fullWidth
            error={Boolean(errors.lecturer)}
            helperText={errors.lecturer}
            slotProps={{
              input: { 'aria-invalid': Boolean(errors.lecturer) },
              helperText: {
                sx: {
                  color: errors.lecturer ? 'error.main' : 'text.secondary',
                },
              },
            }}
          />

          <TextField
            required
            id="year"
            name="year"
            label="Year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            onBlur={() => validateField("year", formData.year)}
            fullWidth
            error={Boolean(errors.year)}
            helperText={errors.year}
            slotProps={{
              input: { 'aria-invalid': Boolean(errors.year) },
              helperText: {
                sx: {
                  color: errors.year ? 'error.main' : 'text.secondary',
                },
              },
            }}
          />

          <TextField
            required
            id="semester"
            name="semester"
            label="Semester"
            value={formData.semester}
            onChange={handleChange}
            onBlur={() => validateField("semester", formData.semester)}
            fullWidth
            select
            error={Boolean(errors.semester)}
            helperText={errors.semester}
            slotProps={{
              input: { 'aria-invalid': Boolean(errors.semester) },
              helperText: {
                sx: {
                  color: errors.semester ? 'error.main' : 'text.secondary',
                },
              },
            }}
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
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
                if (confirmCancel) navigate("/CoursesManage");
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
