// src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
// Add useLocation import
import { useNavigate, useLocation } from 'react-router-dom';
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// --- LocalStorage Key, Placeholders, Helpers (Keep as is) ---
const TASKS_STORAGE_KEY = 'Task';

const placeholderTasks = Array.from({ length: 10 }, (_, i) => {
    const code = (101 + i).toString();
    const courseIndex = i % 3;
    const courses = ['CS101', 'MA202', 'PH305'];
    const submissionDate = dayjs().add(i + 7, 'day').toISOString();
    return {
        assignmentCode: code, courseCode: courses[courseIndex], assignmentName: `Placeholder Task ${i + 1}`,
        submissionDate: submissionDate, description: `This is a static placeholder description for task ${code}.`,
    };
});

const saveTasksToStorage = (tasks) => {
    try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) { console.error("Failed to save tasks to localStorage:", error); }
};

const getStoredTasks = () => {
    try {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            if (Array.isArray(parsedTasks)) { return parsedTasks; }
            else { console.warn("Data in localStorage for tasks was not an array. Using placeholders."); }
        } else { console.log("No tasks found in localStorage. Using placeholders."); }
    } catch (error) { console.error("Error parsing tasks from localStorage. Using placeholders.", error); }
    console.log("Saving placeholder tasks to localStorage.");
    saveTasksToStorage(placeholderTasks);
    return placeholderTasks;
};

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
    } catch (error) { console.error("Error loading/parsing courses from localStorage:", error); }
    console.warn("No valid courses found in localStorage for TaskManage, using fallback.");
    return [
        { code: 'CS101', name: 'Introduction to Computer Science' }, { code: 'MA202', name: 'Calculus II' },
        { code: 'PH305', name: 'Modern Physics' },
    ];
};

const checkAssignmentCodeExists = async (code) => {
    const existingTasks = getStoredTasks();
    const exists = existingTasks.some(task => task.assignmentCode === code);
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`Code ${code} exists in localStorage: ${exists}`);
    return exists;
};
// --- End Placeholder Data & Functions ---

const initialFormData = {
    assignmentCode: '', courseCode: '', assignmentName: '',
    submissionDate: null, description: '',
};

// Remove initialData and isEditMode props from the function signature
export default function TaskForm({ onSubmit }) {
    const navigate = useNavigate();
    // --- Use useLocation to get state ---
    const location = useLocation();
    const taskToEdit = location.state?.taskToEdit; // Get task data from navigation state
    const isEditMode = !!taskToEdit; // Determine if it's edit mode based on taskToEdit existence

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [isCheckingCode, setIsCheckingCode] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [availableCourses, setAvailableCourses] = useState([]);

    useEffect(() => {
        const courses = getExistingCourses();
        setAvailableCourses(courses);
    }, []);

    // --- Populate form based on taskToEdit from location state ---
    useEffect(() => {
        if (isEditMode && taskToEdit) {
            console.log("TaskForm: Edit mode detected. Populating form with:", taskToEdit);
            setFormData({
                assignmentCode: taskToEdit.assignmentCode || '',
                courseCode: taskToEdit.courseCode || '',
                assignmentName: taskToEdit.assignmentName || '',
                submissionDate: taskToEdit.submissionDate ? dayjs(taskToEdit.submissionDate) : null,
                description: taskToEdit.description || '',
            });
            setErrors({}); // Clear errors when loading data
            setSubmitError('');
        } else {
            console.log("TaskForm: Add mode detected. Resetting form.");
            // Reset form to initial state for 'add' mode
            setFormData(initialFormData);
            setErrors({});
            setSubmitError('');
        }
        // Depend on the task object from location state
    }, [isEditMode, taskToEdit]); // Use isEditMode and taskToEdit derived from location

    // --- Validation Function (Keep as is, it correctly uses isEditMode) ---
    const validateField = async (name, value) => {
        let error = '';
        // (Validation logic remains the same - it already checks isEditMode for assignmentCode)
        if (name === 'assignmentCode') {
            if (!isEditMode) { // Only validate code uniqueness/format if NOT editing
                const codeValue = value || '';
                if (!/^\d+$/.test(codeValue)) { error = 'Code must contain only numbers.'; }
                else if (codeValue.length !== 3) { error = 'Code must be exactly 3 digits.'; }
                else if (parseInt(codeValue, 10) <= 0) { error = 'Code must be a positive number.'; }
                else {
                    setIsCheckingCode(true);
                    setErrors(prev => ({ ...prev, assignmentCode: '' }));
                    const exists = await checkAssignmentCodeExists(codeValue);
                    if (exists) { error = 'Assignment code already exists.'; }
                    setIsCheckingCode(false);
                }
            }
        } else if (name === 'courseCode') {
            if (!value) { error = 'Please select a course.'; }
        } else if (name === 'assignmentName') {
            if (!value || !value.trim()) { error = 'Assignment name is required.'; }
        } else if (name === 'submissionDate') {
            if (!value) { error = 'Submission date is required.'; }
            else if (!dayjs(value).isValid()) { error = 'Invalid date format.'; }
            else {
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

    // --- Handlers (Keep handleInputChange, handleDateChange, handleBlur as is) ---
     const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        if (errors[name]) { setErrors(prev => ({ ...prev, [name]: '' })); }
    };
     const handleDateChange = (newValue) => {
        setFormData(prevData => ({ ...prevData, submissionDate: newValue }));
        if (errors.submissionDate) { setErrors(prev => ({ ...prev, submissionDate: '' })); }
    };
    const handleBlur = async (e) => {
        const { name } = e.target;
        const value = formData[name];
        await validateField(name, value);
    };

    // --- Submit Handler (Adjusted to use taskToEdit) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        // Re-validate all fields on submit
        const validationResults = await Promise.all([
            validateField('assignmentCode', formData.assignmentCode), // Will skip uniqueness check if isEditMode=true
            validateField('courseCode', formData.courseCode),
            validateField('assignmentName', formData.assignmentName),
            validateField('submissionDate', formData.submissionDate)
        ]);

        const hasValidationErrors = validationResults.some(error => !!error);
        // Check current state errors as well, in case blur validation didn't run for all fields
        const hasCurrentStateErrors = Object.values(errors).some(error => !!error);

        if (hasValidationErrors || hasCurrentStateErrors || isCheckingCode) {
            console.log('Validation errors present or check in progress.');
            setSubmitError('Please fix the errors above before submitting.');
            return;
        }

        // Use the original assignmentCode from taskToEdit if editing
        const taskData = {
            ...formData,
            // Crucially, use the *original* code when editing
            assignmentCode: isEditMode ? taskToEdit.assignmentCode : formData.assignmentCode,
            submissionDate: formData.submissionDate ? formData.submissionDate.toISOString() : null,
        };

        console.log('Saving Task Data:', taskData);
        const existingTasks = getStoredTasks();
        let updatedTasks;

        if (isEditMode) {
            // Find the task by its original code and replace it
            updatedTasks = existingTasks.map(task =>
                task.assignmentCode === taskToEdit.assignmentCode ? taskData : task
            );
            console.log(`Updating task with code: ${taskToEdit.assignmentCode}`);
        } else {
            // Add the new task
            updatedTasks = [...existingTasks, taskData];
            console.log(`Adding new task with code: ${taskData.assignmentCode}`);
        }

        saveTasksToStorage(updatedTasks);
        console.log("Tasks saved to localStorage successfully.");

        // Call onSubmit if provided (optional)
        if (onSubmit) {
            onSubmit(taskData);
        }

        // Always navigate back to the manage page after saving
        navigate('/TaskManage');

        // No need to reset form in edit mode, just navigate away
        // Resetting form is only needed after *adding* if staying on the form page,
        // but since we navigate away, it's handled by the useEffect on next load.
    };

    // --- Cancel Handler (Keep as is) ---
    const handleCancel = () => {
        console.log("Cancel clicked, navigating to /TaskManage");
        navigate('/TaskManage');
    };

    // --- Rendering ---
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ /* Styling (keep as is) */
                    display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600,
                    margin: 'auto', p: 3, border: '1px solid', borderColor: 'divider',
                    borderRadius: 2, mt: 4,
                }}
            >
                <Typography variant="h5" component="h2" gutterBottom>
                    {/* Title changes based on isEditMode derived from location state */}
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
                    // --- THIS IS THE KEY PART for disabling ---
                    disabled={isEditMode} // Disable if in edit mode
                    error={!!errors.assignmentCode}
                    helperText={errors.assignmentCode || (isCheckingCode && !isEditMode ? 'Checking uniqueness...' : ' ')} // Show checking only if not editing
                    inputProps={{ maxLength: 3 }}
                    InputProps={{
                        readOnly: isEditMode, // Also set readOnly for clarity
                        endAdornment: isCheckingCode && !isEditMode ? <CircularProgress size={20} /> : null,
                    }}
                />

                {/* Course Code Select Dropdown (Keep as is) */}
                <FormControl fullWidth required error={!!errors.courseCode}>
                    <InputLabel id="courseCode-label">Course</InputLabel>
                    <Select
                        labelId="courseCode-label" id="courseCode" name="courseCode"
                        value={formData.courseCode} label="Course"
                        onChange={handleInputChange} onBlur={handleBlur}
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

                {/* Assignment Name Input (Keep as is) */}
                <TextField
                    id="assignmentName" name="assignmentName" label="Assignment Name"
                    value={formData.assignmentName} onChange={handleInputChange} onBlur={handleBlur}
                    required fullWidth error={!!errors.assignmentName} helperText={errors.assignmentName || ' '}
                />

                {/* Submission Date Picker (Keep as is) */}
                 <DatePicker
                    label="Submission Date" value={formData.submissionDate} onChange={handleDateChange}
                    minDate={dayjs().add(1, 'day')}
                    slotProps={{
                        textField: {
                            fullWidth: true, required: true, name: 'submissionDate',
                            error: !!errors.submissionDate, helperText: errors.submissionDate || ' ',
                            onBlur: handleBlur
                        },
                    }}
                />

                {/* Assignment Description Text Area (Keep as is) */}
                <TextField
                    id="description" name="description" label="Description"
                    value={formData.description} onChange={handleInputChange}
                    multiline rows={4} fullWidth helperText=" "
                />

                 {/* General Submission Error Message Area (Keep as is) */}
                 {submitError && ( <Alert severity="error" sx={{ mt: 1 }}>{submitError}</Alert> )}

                {/* Action Buttons (Cancel and Save) */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                     <Button variant="outlined" onClick={handleCancel}> Cancel </Button>
                    <Button
                        type="submit" variant="contained"
                        // Disable save if checking code OR if there are *any* validation errors
                        disabled={isCheckingCode || Object.values(errors).some(e => !!e)}
                    >
                        {/* Change button text based on mode */}
                        {isEditMode ? 'Update Task' : 'Save Task'}
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
}
