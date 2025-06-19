// ✅ שדרוג: מניעת כפילויות בשם קורס עם נורמליזציה + שגיאה חיה בשדה הקלט

import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  addCourse,
  updateCourse,
  listCourses,
  getCourseById,
} from "../firebase/course";

export default function CourseForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

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
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    async function loadCourses() {
      const courses = await listCourses();
      setAllCourses(courses);
    }
    loadCourses();
  }, []);

  useEffect(() => {
    async function loadCourseToEdit() {
      if (id) {
        const course = await getCourseById(id);
        if (course) setFormData(course);
      } else if (location.state?.courseToEdit) {
        setFormData(location.state.courseToEdit);
      }
    }
    loadCourseToEdit();
  }, [id, location.state]);

  const normalize = (str) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  const validateField = (name, value) => {
    let error = "";

    if (name === "courseName") {
      if (!value.trim()) {
        error = "Course name is required";
      } else {
        const normalizedValue = normalize(value);
        const isDuplicate = allCourses.some(
          (c) => normalize(c.courseName) === normalizedValue && c.id !== formData.id
        );
        if (isDuplicate) {
          error = "A course with this name already exists";
        }
      }
    }

    if (name === "lecturer" && !value.trim()) {
      error = "Lecturer name is required";
    }

    if (name === "semester" && !value) {
      error = "Semester is required";
    }

    if (name === "year") {
      const year = Number(value);
      if (!year || year < 2020 || year > 2030) {
        error = "Year must be between 2020 and 2030";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validate = () => {
    const fields = ["courseName", "lecturer", "semester", "year"];
    fields.forEach((field) => validateField(field, formData[field]));
    return Object.values(errors).every((error) => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const isEditMode = !!formData.id;

    if (isEditMode) {
      await updateCourse(formData);
      setSnackbar({ open: true, message: "Course updated", severity: "success" });
    } else {
      const { id: courseId, ...data } = formData;
      const added = await addCourse(data); 
      setFormData((prev) => ({ ...prev, courseCode: added.courseCode }));
      setSnackbar({ open: true, message: "Course added", severity: "success" });
    }

    setTimeout(() => navigate("/coursesManage"), 800);
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
          {id ? "Edit Course" : "Add Course"}
        </Typography>

        <form onSubmit={handleSubmit}>
          {formData.courseCode && (
            <TextField
              label="Course Code"
              value={formData.courseCode}
              fullWidth
              margin="normal"
              disabled
            />
          )}

          <TextField
            name="courseName"
            label="Course Name"
            value={formData.courseName}
            onChange={handleChange}
            error={!!errors.courseName}
            helperText={errors.courseName}
            fullWidth
            margin="normal"
            disabled={!!formData.id}
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
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
      </Paper>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure? Unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} color="primary">
            No
          </Button>
          <Button onClick={() => navigate("/coursesManage")} color="secondary">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
