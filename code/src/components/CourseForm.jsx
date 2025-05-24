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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addCourse,
  updateCourse,
  listCourses
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

  // ✅ שינוי: טוען את כל הקורסים לבדיקה של כפילויות
  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    async function loadCourses() {
      const courses = await listCourses();
      setAllCourses(courses);
    }
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseToEdit) {
      setFormData(courseToEdit);
    }
  }, [courseToEdit]);

  function validate() {
    const errors = {};

    if (formData.courseCode.trim() === "") {
      errors.courseCode = "Course code is required";
    }

    if (formData.courseName.trim() === "") {
      errors.courseName = "Course name is required";
    }

    if (formData.lecturer.trim() === "") {
      errors.lecturer = "Lecturer is required";
    }

    if (formData.semester.trim() === "") {
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
    return Object.keys(errors).length === 0;
  }

  // ✅ שינוי: מנקה שגיאה לשדה הספציפי כשמשתמשת מקלידה בו
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  // ✅ שינוי: בדיקת שגיאות כפילויות כולל Course Code במצב הוספה בלבד
  async function handleSubmit(event) {
    event.preventDefault();

    const isValid = validate();
    if (!isValid) return;

    const isEditMode = formData.id !== undefined && formData.id !== null;

    let duplicateErrors = {};

    allCourses.forEach((course) => {
      const isSameId = course.id === formData.id;
      const isSameName = course.courseName.trim().toLowerCase() === formData.courseName.trim().toLowerCase();
      const isSameCode = course.courseCode === formData.courseCode;
      const isSameSemester = course.semester === formData.semester;
      const isSameLecturer = course.lecturer.trim().toLowerCase() === formData.lecturer.trim().toLowerCase();

      if (!isSameId) {
        if (isSameName && isSameCode && isSameSemester) {
          duplicateErrors.courseName = "Course with this name already exists in the same semester and code";
        }
        if (isSameName && isSameLecturer) {
          duplicateErrors.lecturer = "This lecturer is already assigned to a course with this name";
        }
        if (!isEditMode && isSameCode) {
          duplicateErrors.courseCode = "Course code already exists";
        }
      }
    });

    if (Object.keys(duplicateErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...duplicateErrors }));
      return;
    }

    if (!isEditMode) {
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

    setTimeout(() => {
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
          disabled={!!formData.id} // 🔒 נעול במצב עריכה
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
          disabled={!!formData.id} // 🔒 נעול במצב עריכה
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
