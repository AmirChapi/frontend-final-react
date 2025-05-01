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
import { useNavigate, useLocation } from "react-router-dom";

export default function CourseForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const courseToEdit = location.state?.courseToEdit || null;

  const initialValues = {
    courseCode: "",
    courseName: "",
    lecturer: "",
    year: "",
    semester: "",
  };

  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
    setCourses(storedCourses);
    if (courseToEdit) {
      setFormData({ ...courseToEdit });
    }
  }, [courseToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let errorField = false;
    const currentYear = new Date().getFullYear();

    if (name === "courseCode") {
      errorField = !(value.length === 3 && /^[0-9]+$/.test(value) && parseInt(value) > 0);
    }

    if (name === "courseName") {
      errorField = !value.trim() || !/^[A-Za-z\s]+$/.test(value);
    }

    if (name === "lecturer") {
      errorField = !value.trim();
    }

    if (name === "year") {
      const year = parseInt(value);
      errorField = !(value.length === 4 && year > 2000 && year <= currentYear);
    }

    if (name === "semester") {
      errorField = !value.trim();
    }

    setErrors((prev) => ({ ...prev, [name]: errorField }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    const year = parseInt(formData.year);

    if (!(formData.courseCode.length === 3 && /^[0-9]+$/.test(formData.courseCode) && parseInt(formData.courseCode) > 0)) {
      newErrors.courseCode = true;
      hasError = true;
    }

    if (!formData.courseName.trim() || !/^[A-Za-z\s]+$/.test(formData.courseName)) {
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

    const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
    const isDuplicate = !courseToEdit && storedCourses.some((course) => course.courseCode === formData.courseCode);

    if (isDuplicate) {
      setError("This course already exists.");
      return;
    }

    const updatedCourses = courseToEdit
      ? storedCourses.map((course) =>
          course.courseCode === courseToEdit.courseCode ? formData : course
        )
      : [...storedCourses, formData];

    localStorage.setItem("coursesList", JSON.stringify(updatedCourses));
    setOpenSnackbar(true);
    setTimeout(() => navigate("/CoursesManage"), 1000);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCancelClick = () => {
    setOpenCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate("/CoursesManage");
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  return (
    <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {courseToEdit ? "Edit Course" : "Add new Course"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            id="courseCode"
            name="courseCode"
            label="Course Code"
            value={formData.courseCode}
            onChange={handleChange}
            fullWidth
            disabled={!!courseToEdit}
            error={errors.courseCode}
            helperText={errors.courseCode ? "Course code must be a positive 3-digit number" : ""}
          />

          <TextField
            id="courseName"
            name="courseName"
            label="Course Name"
            value={formData.courseName}
            onChange={handleChange}
            fullWidth
            error={errors.courseName}
            helperText={errors.courseName ? "Course name must be only English letters and spaces" : ""}
          />

          <TextField
            id="lecturer"
            name="lecturer"
            label="Lecturer"
            value={formData.lecturer}
            onChange={handleChange}
            fullWidth
            error={errors.lecturer}
            helperText={errors.lecturer ? "Lecturer is required" : ""}
          />

          <TextField
            id="year"
            name="year"
            label="Year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            fullWidth
            error={errors.year}
            helperText={errors.year ? "Year must be after 2000 and 4 digits" : ""}
          />

          <TextField
            id="semester"
            name="semester"
            label="Semester"
            value={formData.semester}
            onChange={handleChange}
            fullWidth
            select
            error={errors.semester}
            helperText={errors.semester ? "Semester is required" : ""}
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
            <Button variant="outlined" onClick={handleCancelClick} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" sx={{ width: "100%" }} onClose={handleCloseSnackbar}>
          Course successfully saved!
        </Alert>
      </Snackbar>

      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">{"Confirm Cancellation"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel? Unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmCancel} color="secondary" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}