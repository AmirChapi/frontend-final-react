import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';

// --- Date Picker Imports ---
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// --- LocalStorage Key for Tasks ---
const TASKS_STORAGE_KEY = 'Task';

// --- Static Placeholder Tasks (Used if localStorage is empty) ---
const placeholderTasks = Array.from({ length: 10 }, (_, i) => {
    const code = (101 + i).toString(); // Example: 101, 102, ... 110
    const courseIndex = i % 3; // Cycle through CS101, MA202, PH305
    const courses = ['CS101', 'MA202', 'PH305'];
    const submissionDate = dayjs().add(i + 7, 'day').toISOString(); // Staggered future dates

    return {
        assignmentCode: code,
        courseCode: courses[courseIndex],
        assignmentName: `Placeholder Task ${i + 1}`,
        submissionDate: submissionDate,
        description: `This is a static placeholder description for task ${code}.`,
    };
});
// --- End Static Placeholder Tasks ---


// --- Helper Functions for LocalStorage ---
const getStoredTasks = () => {
    try {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            // Ensure it's an array before returning
            if (Array.isArray(parsedTasks)) {
                console.log("Found valid tasks in localStorage.");
                return parsedTasks;
            } else {
                console.warn("Data in localStorage for tasks was not an array. Using placeholders.");
            }
        } else {
            console.log("No tasks found in localStorage. Using placeholders.");
        }
    } catch (error) {
        console.error("Error parsing tasks from localStorage. Using placeholders.", error);
    }

    // If we reach here, it means storage was empty, invalid, or parsing failed
    // Save the placeholders back to storage for next time
    console.log("Saving placeholder tasks to localStorage.");
    saveTasksToStorage(placeholderTasks);
    return placeholderTasks;
};

const saveTasksToStorage = (tasks) => {
    try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Failed to save tasks to localStorage:", error);
        // Handle potential storage errors (e.g., quota exceeded) if necessary
    }
};
// --- End Helper Functions ---

// --- Course Data Fetching (Keep as is) ---
const getExistingCourses = () => {
    const COURSES_STORAGE_KEY = 'coursesList';
    try {
        const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
        if (storedCourses) {
            const parsedCourses = JSON.parse(storedCourses);
            if (Array.isArray(parsedCourses)) {
                 return parsedCourses.map(course => ({ code: course.id, name: course.name }));
            }
        }
    } catch (error) {
         console.error("Error loading/parsing courses from localStorage:", error);
    }
    console.warn("No valid courses found in localStorage for TaskManage, using fallback.");
    return [
        { code: 'CS101', name: 'Introduction to Computer Science' },
        { code: 'MA202', name: 'Calculus II' },
        { code: 'PH305', name: 'Modern Physics' },
    ];
};

// --- Assignment Code Check (Relies on getStoredTasks) ---
const checkAssignmentCodeExists = async (code) => {
    console.log(`Checking localStorage for task code: ${code}`);
    // getStoredTasks now handles initialization if needed
    const existingTasks = getStoredTasks();
    const exists = existingTasks.some(task => task.assignmentCode === code);
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
    console.log(`Code ${code} exists in localStorage: ${exists}`);
    return exists;
};
// --- End Placeholder Data & Functions ---

// Initial state structure for the form data
const initialFormData = {
    assignmentCode: '',
    courseCode: '',
    assignmentName: '',
    submissionDate: null, // Use null for DatePicker
    description: '',
};

export default function TaskManage({ initialData = null, isEditMode = false, onSubmit }) {
    // --- Single State for Form Data ---
    const [formData, setFormData] = useState(initialFormData);

    // --- Other State Variables (Keep separate) ---
    const [errors, setErrors] = useState({});
    const [isCheckingCode, setIsCheckingCode] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [availableCourses, setAvailableCourses] = useState([]);

    // --- Navigation ---
    const navigate = useNavigate();

    // --- Fetch Available Courses ---
    useEffect(() => {
        const courses = getExistingCourses();
        setAvailableCourses(courses);
    }, []);

    // --- Effects ---
    // Populate form based on initialData or reset
    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                assignmentCode: initialData.assignmentCode || '',
                courseCode: initialData.courseCode || '',
                assignmentName: initialData.assignmentName || '',
                submissionDate: initialData.submissionDate ? dayjs(initialData.submissionDate) : null,
                description: initialData.description || '',
            });
            setErrors({});
            setSubmitError('');
        } else {
             // Reset form to initial state
             setFormData(initialFormData);
             setErrors({});
             setSubmitError('');
        }
    }, [isEditMode, initialData]);

    // --- Validation Function ---
    const validateField = async (name, value) => {
        let error = '';

        if (name === 'assignmentCode') {
            if (!isEditMode) {
                const codeValue = value || '';
                if (!/^\d+$/.test(codeValue)) {
                    error = 'Code must contain only numbers.';
                } else if (codeValue.length !== 3) {
                    error = 'Code must be exactly 3 digits.';
                } else if (parseInt(codeValue, 10) <= 0) {
                    error = 'Code must be a positive number.';
                } else {
                    setIsCheckingCode(true);
                    setErrors(prev => ({ ...prev, assignmentCode: '' }));
                    // checkAssignmentCodeExists now uses getStoredTasks which initializes if needed
                    const exists = await checkAssignmentCodeExists(codeValue);
                    if (exists) {
                        error = 'Assignment code already exists.';
                    }
                    setIsCheckingCode(false);
                }
            }
        } else if (name === 'courseCode') {
            if (!value) {
                error = 'Please select a course.';
            }
        } else if (name === 'assignmentName') {
            if (!value || !value.trim()) {
                error = 'Assignment name is required.';
            }
        } else if (name === 'submissionDate') {
            if (!value) {
                error = 'Submission date is required.';
            } else if (!dayjs(value).isValid()) {
                error = 'Invalid date format.';
            } else {
                const today = dayjs().startOf('day');
                const selectedDate = dayjs(value).startOf('day');
                if (selectedDate.isBefore(today) || selectedDate.isSame(today)) {
                    error = 'Submission date must be in the future.';
                }
            }
        }

        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        return error;
    };

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));

        if (errors[name]) {
             setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

     const handleDateChange = (newValue) => {
        setFormData(prevData => ({
            ...prevData,
            submissionDate: newValue,
        }));

        if (errors.submissionDate) {
            setErrors(prev => ({ ...prev, submissionDate: '' }));
        }
    };

    const handleBlur = async (e) => {
        const { name } = e.target;
        const value = formData[name];
        await validateField(name, value);
    };

    // --- Submit Handler (Handles the "Save" action) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        const validationResults = await Promise.all([
            validateField('assignmentCode', formData.assignmentCode),
            validateField('courseCode', formData.courseCode),
            validateField('assignmentName', formData.assignmentName),
            validateField('submissionDate', formData.submissionDate)
        ]);

        const hasValidationErrors = validationResults.some(error => !!error);
        const hasCurrentStateErrors = Object.values(errors).some(error => !!error);

        if (hasValidationErrors || hasCurrentStateErrors || isCheckingCode) {
            console.log('Validation errors present or check in progress.');
            setSubmitError('Please fix the errors above before submitting.');
            return;
        }

        const taskData = {
            ...formData,
            assignmentCode: isEditMode ? initialData.assignmentCode : formData.assignmentCode,
            submissionDate: formData.submissionDate ? formData.submissionDate.toISOString() : null,
        };

        console.log('Saving Task Data:', taskData);

        // getStoredTasks handles initialization if needed
        const existingTasks = getStoredTasks();
        let updatedTasks;

        if (isEditMode) {
            updatedTasks = existingTasks.map(task =>
                task.assignmentCode === taskData.assignmentCode ? taskData : task
            );
            console.log(`Updating task with code: ${taskData.assignmentCode}`);
        } else {
            updatedTasks = [...existingTasks, taskData];
             console.log(`Adding new task with code: ${taskData.assignmentCode}`);
        }

        saveTasksToStorage(updatedTasks);
        console.log("Tasks saved to localStorage successfully.");

        if (onSubmit) {
            onSubmit(taskData);
            
        }

        if (!isEditMode) {
            setFormData(initialFormData);
            setErrors({});
        } else {
            navigate('/TaskForm');
        }
    };

    // --- Cancel Handler ---
    const handleCancel = () => {
        console.log("Cancel clicked, navigating to /TaskForm");
        navigate('/TaskForm');
    };


    // --- Rendering ---
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    maxWidth: 600,
                    margin: 'auto',
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mt: 4,
                }}
            >
                <Typography variant="h5" component="h2" gutterBottom>
                    {isEditMode ? 'Edit Task' : 'Add New Task'}
                </Typography>

                {/* Assignment Code Input */}
                <TextField
                    id="assignmentCode"
                    name="assignmentCode"
                    label="Assignment Code"
                    value={formData.assignmentCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    disabled={isEditMode}
                    error={!!errors.assignmentCode}
                    helperText={errors.assignmentCode || (isCheckingCode ? 'Checking uniqueness...' : ' ')}
                    inputProps={{ maxLength: 3 }}
                    InputProps={{
                        readOnly: isEditMode,
                        endAdornment: isCheckingCode && !isEditMode ? <CircularProgress size={20} /> : null,
                    }}
                />

                {/* Course Code Select Dropdown */}
                <FormControl fullWidth required error={!!errors.courseCode}>
                    <InputLabel id="courseCode-label">Course</InputLabel>
                    <Select
                        labelId="courseCode-label"
                        id="courseCode"
                        name="courseCode"
                        value={formData.courseCode}
                        label="Course"
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                    >
                        <MenuItem value="" disabled><em>-- Select a Course --</em></MenuItem>
                        {availableCourses.map(course => (
                            <MenuItem key={course.code} value={course.code}>
                                {course.code} - {course.name}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.courseCode && <FormHelperText>{errors.courseCode}</FormHelperText>}
                </FormControl>

                {/* Assignment Name Input */}
                <TextField
                    id="assignmentName"
                    name="assignmentName"
                    label="Assignment Name"
                    value={formData.assignmentName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    error={!!errors.assignmentName}
                    helperText={errors.assignmentName || ' '}
                />

                {/* Submission Date Picker */}
                 <DatePicker
                    label="Submission Date"
                    value={formData.submissionDate}
                    onChange={handleDateChange}
                    minDate={dayjs().add(1, 'day')}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            required: true,
                            name: 'submissionDate',
                            error: !!errors.submissionDate,
                            helperText: errors.submissionDate || ' ',
                            onBlur: handleBlur
                        },
                    }}
                />

                {/* Assignment Description Text Area */}
                <TextField
                    id="description"
                    name="description"
                    label="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    fullWidth
                    helperText=" "
                />

                 {/* General Submission Error Message Area */}
                 {submitError && (
                    <Alert severity="error" sx={{ mt: 1 }}>{submitError}</Alert>
                 )}

                {/* Action Buttons (Cancel and Save) */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                     <Button variant="outlined" onClick={handleCancel}>
                         Cancel
                     </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isCheckingCode || Object.values(errors).some(e => !!e)}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
}
