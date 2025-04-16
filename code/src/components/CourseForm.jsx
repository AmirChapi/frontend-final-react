// src/components/CourseForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert'; // For success message

// --- LocalStorage Key for Courses (ensure it matches CoursesManage.jsx) ---
const COURSES_STORAGE_KEY = 'coursesList';

export default function CourseForm() {
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [submitStatus, setSubmitStatus] = useState({ message: '', severity: '' }); // For user feedback

  const navigate = useNavigate(); // Initialize useNavigate

  // --- Input Handlers (remain the same) ---
  const handleCourseIdChange = (event) => setCourseId(event.target.value);
  const handleCourseNameChange = (event) => setCourseName(event.target.value);
  const handleLecturerNameChange = (event) => setLecturerName(event.target.value);
  const handleYearChange = (event) => setYear(event.target.value);
  const handleSemesterChange = (event) => setSemester(event.target.value);
  // --- End Input Handlers ---

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitStatus({ message: '', severity: '' }); // Clear previous status

    // Basic validation
    if (
      !courseId.trim() ||
      !courseName.trim() ||
      !lecturerName.trim() ||
      !year.toString().trim() || // Ensure year is treated as string for trim
      !semester
    ) {
      setSubmitStatus({ message: 'Please fill in all fields.', severity: 'error' });
      return;
    }

    const newCourse = {
      // Ensure consistent data types (e.g., year as number if needed later)
      id: courseId.trim(),
      name: courseName.trim(),
      lecturer: lecturerName.trim(),
      year: parseInt(year, 10), // Store year as number
      semester: semester,
    };

    try {
        // --- Add to Local Storage ---
        console.log('Adding new course to localStorage:', newCourse);
        const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
        const currentCourses = storedCourses ? JSON.parse(storedCourses) : [];

        // Optional: Check if course ID already exists
        if (currentCourses.some(course => course.id === newCourse.id)) {
             setSubmitStatus({ message: `Course with ID ${newCourse.id} already exists.`, severity: 'warning' });
             return; // Stop submission if ID exists
        }


        currentCourses.push(newCourse);
        localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(currentCourses));
        // --- End Add to Local Storage ---

        // Provide success feedback
        setSubmitStatus({ message: 'Course added successfully!', severity: 'success' });

        // Clear the form fields
        setCourseId('');
        setCourseName('');
        setLecturerName('');
        setYear('');
        setSemester('');

        // Navigate back to the management page after a short delay
        setTimeout(() => {
            navigate('/CoursesManage');
        }, 1000); // 1 second delay to show success message

    } catch (error) {
        console.error("Error saving course to localStorage:", error);
        setSubmitStatus({ message: 'Failed to save course. Please try again.', severity: 'error' });
    }
  };

  // Generate the last 3 years for the select list (optional, as TextField is used)
  // const currentYear = new Date().getFullYear();
  // const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root, & .MuiFormControl-root': { m: 1, width: '30ch' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        px: 2, // Add padding
      }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Add New Course
      </Typography>

      {/* Display Submission Status */}
      {submitStatus.message && (
        <Alert severity={submitStatus.severity} sx={{ width: '30ch', mb: 2 }}>
          {submitStatus.message}
        </Alert>
      )}

      {/* --- Form Fields (remain the same) --- */}
      <TextField
        required
        id="course-id"
        label="Course ID"
        value={courseId}
        onChange={handleCourseIdChange}
        error={submitStatus.severity === 'error' && !courseId.trim()} // Basic error highlight
        helperText={submitStatus.severity === 'error' && !courseId.trim() ? 'Required' : ''}
      />
      <TextField
        required
        id="course-name"
        label="Course Name"
        value={courseName}
        onChange={handleCourseNameChange}
        error={submitStatus.severity === 'error' && !courseName.trim()}
        helperText={submitStatus.severity === 'error' && !courseName.trim() ? 'Required' : ''}
      />
      <TextField
        required
        id="lecturer-name"
        label="Lecturer Name"
        value={lecturerName}
        onChange={handleLecturerNameChange}
        error={submitStatus.severity === 'error' && !lecturerName.trim()}
        helperText={submitStatus.severity === 'error' && !lecturerName.trim() ? 'Required' : ''}
      />
       <TextField
        required
        id="year"
        label="Year"
        type="number"
        value={year}
        onChange={handleYearChange}
        error={submitStatus.severity === 'error' && !year.toString().trim()}
        helperText={submitStatus.severity === 'error' && !year.toString().trim() ? 'Required' : ''}
      />
      <FormControl required sx={{ m: 1, width: '30ch' }} error={submitStatus.severity === 'error' && !semester}>
        <InputLabel id="semester-label">Semester</InputLabel>
        <Select
          labelId="semester-label"
          id="semester"
          value={semester}
          label="Semester"
          onChange={handleSemesterChange}
        >
          <MenuItem value={'A'}>Semester A</MenuItem>
          <MenuItem value={'B'}>Semester B</MenuItem>
          <MenuItem value={'Summer'}>Summer Semester</MenuItem>
        </Select>
        {submitStatus.severity === 'error' && !semester && <Typography variant="caption" color="error" sx={{ pl: 2, pt: 1 }}>Required</Typography>}
      </FormControl>
      {/* --- End Form Fields --- */}

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Add Course
      </Button>
    </Box>
  );
}
