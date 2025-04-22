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

  const [error, setError] = useState("");

  useEffect(() => {
    if (courseToEdit) {
      setFormData(courseToEdit);
    }
  }, [courseToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Basic validation
    if (!formData.courseCode || !formData.courseName || !formData.lecturer) {
      setError("All fields are required.");
      return;
    }

    const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];

    // Skip the duplicate check for courseCode if we're editing a course
    const isDuplicate = !courseToEdit && storedCourses.some(
      (course) =>
        course.courseCode === formData.courseCode ||
        course.courseName === formData.courseName
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
          {courseToEdit ? "Edit Course" : "New Course Entry"}
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
            fullWidth
            disabled={!!courseToEdit}  // Disable if editing
          />

          <TextField
            required
            id="courseName"
            name="courseName"
            label="Course Name"
            value={formData.courseName}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            required
            id="lecturer"
            name="lecturer"
            label="Lecturer"
            value={formData.lecturer}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            required
            id="year"
            name="year"
            label="Year"
            value={formData.year}
            onChange={handleChange}
            fullWidth
            type="number"
          />

          <TextField
            required
            id="semester"
            name="semester"
            label="Semester"
            value={formData.semester}
            onChange={handleChange}
            fullWidth
            select
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
