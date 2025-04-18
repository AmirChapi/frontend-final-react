// src/components/CourseForm.jsx
// This form handles ADDING and EDITING course definitions.
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// --- LocalStorage Key ---
const COURSES_STORAGE_KEY = 'coursesList'; // Key for course definitions

// --- Helper Functions for LocalStorage ---
const getStoredData = (key) => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            return Array.isArray(parsedData) ? parsedData : null;
        }
    } catch (error) {
        console.error(`Error parsing data from localStorage key "${key}":`, error);
    }
    return null;
};

const saveDataToStorage = (key, data) => {
    try {
        if (!Array.isArray(data)) {
            console.error(`Attempted to save non-array data to localStorage key "${key}".`);
            return false;
        }
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Failed to save data to localStorage key "${key}":`, error);
        return false;
    }
};
// --- End Helper Functions ---

// Initial state for the course definition form
const initialFormData = {
    id: '',       // Course Code
    name: '',     // Course Name
    lecturer: '', // Keep lecturer field as it was in CoursesManage
    year: '',     // Year the course is offered/defined
    semester: '', // Semester ('A', 'B', 'C')
};

export default function CourseForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const courseToEdit = location.state?.courseToEdit || null;
    const isEditMode = !!courseToEdit;

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState({ error: '', success: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [allCourses, setAllCourses] = useState([]); // Store all courses for uniqueness check

    // --- Load existing courses and pre-fill form if editing ---
    useEffect(() => {
        const loadedCourses = getStoredData(COURSES_STORAGE_KEY) || [];
        setAllCourses(loadedCourses);

        if (isEditMode && courseToEdit) {
            setFormData({
                id: courseToEdit.id || '',
                name: courseToEdit.name || '',
                lecturer: courseToEdit.lecturer || '', // Include lecturer
                year: courseToEdit.year || '',
                semester: courseToEdit.semester || '',
            });
        } else {
            setFormData(initialFormData); // Reset for add mode
        }
        setErrors({});
        setSubmitStatus({ error: '', success: '' });

    }, [isEditMode, courseToEdit]);

    // --- Validation ---
    const validateField = useCallback((name, value) => {
        let error = '';
        const trimmedValue = typeof value === 'string' ? value.trim() : value;

        switch (name) {
            case 'id': // Course Code
                if (!trimmedValue) {
                    error = 'Course Code is required.';
                } else if (!/^\d{4}$/.test(trimmedValue)) { // Must be exactly 4 digits
                    error = 'Course Code must be exactly 4 digits.';
                } else if (parseInt(trimmedValue, 10) <= 0) { // Must be positive
                    error = 'Course Code must be a positive number.';
                } else if (!isEditMode && allCourses.some(course => course.id === trimmedValue)) {
                    // Check uniqueness only in add mode
                    error = 'Course Code already exists.';
                }
                break;

            case 'name': // Course Name
                if (!trimmedValue) {
                    error = 'Course Name is required.';
                } else if (!/^[a-zA-Z\s]+$/.test(trimmedValue)) { // Letters and spaces only
                    error = 'Course Name must contain only letters and spaces.';
                }
                break;

            case 'lecturer': // Keep lecturer validation if needed
                if (!trimmedValue) {
                    error = 'Lecturer Name is required.';
                } else if (!/^[a-zA-Z\s.\-,']+$/.test(trimmedValue)) {
                    error = 'Lecturer Name contains invalid characters.';
                }
                break;

            case 'year': // Year validation (general, not student-specific)
                const yearNum = Number(trimmedValue);
                const currentFullYear = new Date().getFullYear();
                if (!trimmedValue) {
                    error = 'Year is required.';
                } else if (!/^\d{4}$/.test(trimmedValue) || isNaN(yearNum)) {
                    error = 'Please enter a valid 4-digit year.';
                } else if (yearNum < 2000 || yearNum > currentFullYear + 5) { // Example valid range
                    error = `Year must be between 2000 and ${currentFullYear + 5}.`;
                }
                // NOTE: The requirement "Must be greater than the student's registration year"
                // does NOT apply here, as this form defines the course itself, not an assignment.
                break;

            case 'semester': // Semester validation
                if (!trimmedValue) {
                    error = 'Semester is required.';
                } else if (!['A', 'B', 'C'].includes(trimmedValue)) { // Only A, B, C allowed
                    error = "Semester must be 'A', 'B', or 'C'.";
                }
                break;

            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    }, [allCourses, isEditMode]);

    // --- Input Handlers ---
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            validateField(name, value);
        }
        setSubmitStatus({ error: '', success: '' });
    };

    const handleBlur = (event) => {
        const { name, value } = event.target;
        validateField(name, value);
    };

    // --- Form Submission ---
    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitStatus({ error: '', success: '' });
        setIsLoading(true);

        // Validate all fields on submit
        const validationErrors = {};
        let formIsValid = true;
        Object.keys(initialFormData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                validationErrors[key] = error;
                formIsValid = false;
            }
        });

        if (!formIsValid) {
            setErrors(validationErrors);
            setSubmitStatus({ error: 'Please fix the errors above.', success: '' });
            setIsLoading(false);
            return;
        }

        // Prepare course data
        const courseData = {
            id: formData.id.trim(),
            name: formData.name.trim(),
            lecturer: formData.lecturer.trim(),
            year: formData.year.trim(),
            semester: formData.semester.trim(),
        };

        console.log(isEditMode ? 'Updating Course:' : 'Adding Course:', courseData);

        try {
            let updatedCourses = [];
            if (isEditMode) {
                updatedCourses = allCourses.map(course =>
                    course.id === courseToEdit.id ? courseData : course
                );
            } else {
                // Add new course (uniqueness already checked by validation)
                updatedCourses = [...allCourses, courseData];
            }

            const success = saveDataToStorage(COURSES_STORAGE_KEY, updatedCourses);

            if (success) {
                setSubmitStatus({ error: '', success: `Course ${isEditMode ? 'updated' : 'added'} successfully!` });
                setErrors({});
                setTimeout(() => navigate('/CoursesManage'), 1500); // Navigate back
            } else {
                 setSubmitStatus({ error: 'Failed to save course data to storage.', success: '' });
            }

        } catch (err) {
            console.error("CourseForm: Error during submission process:", err);
            setSubmitStatus({ error: 'An unexpected error occurred while saving.', success: '' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Cancel Handler ---
    const handleCancel = () => {
        navigate('/CoursesManage');
    };

    return (
        <Box
            component="form"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2.5,
                maxWidth: 600,
                margin: 'auto',
                p: { xs: 2, sm: 3 },
                border: '1px solid', borderColor: 'divider',
                borderRadius: 2,
                mt: 4,
            }}
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
        >
            <Typography variant="h5" component="h1" gutterBottom>
                {isEditMode ? 'Edit Course Definition' : 'Add New Course'}
            </Typography>

            {/* Course Code (ID) */}
            <TextField
                required
                fullWidth
                id="course-id"
                name="id"
                label="Course Code (4 digits)" // Updated label
                value={formData.id}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.id}
                helperText={errors.id || 'Unique 4-digit numeric code'} // Updated helper text
                disabled={isEditMode} // Correctly disabled in edit mode
                inputProps={{
                    maxLength: 4,
                    inputMode: 'numeric', // Hint for numeric keyboard
                    pattern: '\\d*',      // Allow only digits
                 }}
            />

            {/* Course Name */}
            <TextField
                required
                fullWidth
                id="course-name"
                name="name"
                label="Course Name (Letters Only)" // Updated label
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.name}
                helperText={errors.name || ' '}
            />

            {/* Lecturer */}
            <TextField
                required
                fullWidth
                id="lecturer"
                name="lecturer"
                label="Lecturer Name"
                value={formData.lecturer}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.lecturer}
                helperText={errors.lecturer || ' '}
            />

            {/* Year */}
            <TextField
                required
                fullWidth
                id="year"
                name="year"
                label="Year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.year}
                helperText={errors.year || 'Enter 4-digit year'}
                inputProps={{
                     min: 2000,
                     max: new Date().getFullYear() + 5,
                     step: 1,
                }}
            />

             {/* Semester Selection */}
             <FormControl fullWidth required error={!!errors.semester}>
                <InputLabel id="semester-select-label">Semester</InputLabel>
                <Select
                    labelId="semester-select-label"
                    id="semester-select"
                    name="semester"
                    value={formData.semester}
                    label="Semester"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                >
                    <MenuItem value="" disabled><em>Select semester...</em></MenuItem>
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                    {/* Removed other options like Summer/Winter */}
                </Select>
                {errors.semester && <FormHelperText>{errors.semester}</FormHelperText>}
            </FormControl>


            {/* Submission Feedback Area */}
            {submitStatus.error && (
                <Alert severity="error" sx={{ width: '100%', mt: 1 }}>{submitStatus.error}</Alert>
            )}
            {submitStatus.success && (
                <Alert severity="success" sx={{ width: '100%', mt: 1 }}>{submitStatus.success}</Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, width: '100%', mt: 2 }}>
                 <Button variant="outlined" onClick={handleCancel}>
                    Cancel
                 </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || Object.values(errors).some(e => !!e)}
                >
                    {isLoading ? <CircularProgress size={24} /> : (isEditMode ? 'Update Course' : 'Add Course')}
                </Button>
            </Box>
        </Box>
    );
}
