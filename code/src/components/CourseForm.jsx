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
  FormControl, InputLabel, Select, MenuItem
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

  function validate() {
    const errors = {};

    if (formData.courseCode === "" || formData.courseCode === " ") {
      errors.courseCode = "Course code is required";
    }

    if (formData.courseName === "" || formData.courseName === " ") {
      errors.courseName = "Course name is required";
    }

    if (formData.lecturer === "" || formData.lecturer === " ") {
      errors.lecturer = "Lecturer is required";
    }

    if (formData.semester === "" || formData.semester === " ") {
      errors.semester = "Semester is required";
    }

    if (formData.year === "") {
      errors.year = "Year is required";
    } else if (isNaN(formData.year)) {
      errors.year = "Year must be a number";
    } else {
      const numericYear = Number(formData.year);
      if (numericYear < 2023 || numericYear > 2030) {
        errors.year = "Year must be between 2023 and 2030";
      }
    }

    setErrors(errors);

    if (
      errors.courseCode ||
      errors.courseName ||
      errors.lecturer ||
      errors.semester ||
      errors.year
    ) {
      return false;
    }

    return true;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  async function handleSubmit(event) {
  event.preventDefault(); // עצור את הרענון
  // עכשיו תמשיך עם מה שאתה רוצה לעשות בעצמך..

    const isValid = validate(); // קורא לפונקציית בדיקת תקינות
    if (!isValid) {
      return;
    }

    const isEditMode = formData.id !== undefined && formData.id !== null;

    if (!isEditMode) {
      const courseAlreadyExists = await isCourseCodeExists(formData.courseCode);

      if (courseAlreadyExists) {
        const updatedErrors = {
          courseCode: "Course code already exists"
        };
        setErrors(updatedErrors);
        return;
      }

      await addCourse(formData);

      setSnackbar({
        open: true,
        message: "Course added successfully",
        severity: "success"
      });

    } else {
      await updateCourse(formData);

      setSnackbar({
        open: true,
        message: "Course updated successfully",
        severity: "success"
      });
    }

    setTimeout(function () {
      navigate("/coursesManage");
    }, 1000);
  }


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

        <FormControl fullWidth margin="normal" error={!!errors.semester}>
          <InputLabel id="semester-label">Semester</InputLabel>
          <Select
            labelId="semester-label"
            name="semester"
            value={formData.semester}
            label="Semester"
            onChange={handleChange}
          >
            <MenuItem value=""><em>בחר סמסטר</em></MenuItem>
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
          </Select>
          {errors.semester && (
            <Typography variant="caption" color="error">
              {errors.semester}
            </Typography>
          )}
        </FormControl>
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
