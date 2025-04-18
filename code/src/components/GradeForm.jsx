// src/components/GradeForm.jsx
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
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// --- LocalStorage Keys ---
// Ensure these keys match where you store your student and task data
const STUDENTS_STORAGE_KEY = 'studentsList';
const TASKS_STORAGE_KEY = 'Task';
const GRADES_STORAGE_KEY = 'Grades'; // Key for storing the grades

// --- Helper Functions for LocalStorage ---

// Function to get students
// Adjust the structure (e.g., `student.id`, `student.name`) based on your actual student data format
const getStoredStudents = () => {
    try {
        const storedData = localStorage.getItem(STUDENTS_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData)) {
                console.log("GradeForm: Found students in localStorage.");
                // Assuming students have 'id' and 'name' properties
                return parsedData.filter(student => student && student.id); // Basic validation
            }
        }
    } catch (error) {
        console.error("GradeForm: Error parsing students from localStorage:", error);
    }
    console.warn("GradeForm: No valid students found in localStorage. Returning empty array.");
    return [];
};

// Function to get tasks/assignments
// Adjust the structure (e.g., `task.assignmentCode`, `task.assignmentName`) based on your task data format
const getStoredTasks = () => {
    try {
        const storedData = localStorage.getItem(TASKS_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData)) {
                console.log("GradeForm: Found tasks in localStorage.");
                // Assuming tasks have 'assignmentCode' and 'assignmentName'
                return parsedData.filter(task => task && task.assignmentCode && task.assignmentName); // Basic validation
            }
        }
    } catch (error) {
        console.error("GradeForm: Error parsing tasks from localStorage:", error);
    }
    console.warn("GradeForm: No valid tasks found in localStorage. Returning empty array.");
    return [];
};

// Function to get existing grades
const getStoredGrades = () => {
    try {
        const storedData = localStorage.getItem(GRADES_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData)) {
                return parsedData;
            }
        }
    } catch (error) {
        console.error("GradeForm: Error parsing grades from localStorage:", error);
    }
    return []; // Return empty array if no grades found or error
};

// Function to save grades
const saveGradesToStorage = (grades) => {
    try {
        localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(grades));
        console.log("GradeForm: Saved grades to localStorage.");
    } catch (error) {
        console.error("GradeForm: Failed to save grades to localStorage:", error);
        // Consider throwing the error or returning a status to handle it in the component
        throw new Error("Failed to save grades.");
    }
};
// --- End Helper Functions ---

// Initial state for the form data
const initialFormData = {
    studentId: '',
    assignmentCode: '',
    grade: '', // Use 'grade' as requested, will be validated 0-100
};

export default function GradeForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState({ error: '', success: '' });
    const [isLoading, setIsLoading] = useState(true); // Start loading initially
    const [students, setStudents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedAssignmentName, setSelectedAssignmentName] = useState('');

    // Load students and tasks on component mount
    useEffect(() => {
        setIsLoading(true);
        setSubmitStatus({ error: '', success: '' }); // Clear status on load
        let loadError = '';
        try {
            const studentData = getStoredStudents();
            const taskData = getStoredTasks();
            setStudents(studentData);
            setTasks(taskData);

            if (studentData.length === 0) {
                loadError += 'No student data found. Please add students first. ';
            }
            if (taskData.length === 0) {
                loadError += 'No assignment data found. Please add assignments first.';
            }
            if (loadError) {
                 setSubmitStatus(prev => ({ ...prev, error: loadError.trim() }));
            }

        } catch (err) {
            console.error("GradeForm: Error loading initial data:", err);
            setSubmitStatus({ error: 'Failed to load required student or assignment data.', success: '' });
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    // Validation function for a single field
    const validateField = (name, value, currentFormData) => {
        let error = '';
        const existingGrades = getStoredGrades(); // Get fresh grades for validation

        if (name === 'studentId') {
            if (!value) error = 'Please select a student.';
            // If student changes, re-validate assignment uniqueness if an assignment is selected
            if (value && currentFormData.assignmentCode) {
                 const alreadyGraded = existingGrades.some(
                    grade => grade.studentId === value && grade.assignmentCode === currentFormData.assignmentCode
                );
                 if (alreadyGraded) {
                    // Set error on assignmentCode field as it's the combo that's invalid
                    setErrors(prev => ({ ...prev, assignmentCode: 'This student already has a grade for this assignment.' }));
                 } else {
                    // Clear potential previous error if combo is now valid
                    setErrors(prev => ({ ...prev, assignmentCode: '' }));
                 }
            }

        } else if (name === 'assignmentCode') {
            if (!value) {
                 error = 'Please select an assignment.';
                 setSelectedAssignmentName(''); // Clear name if code is cleared
            } else {
                // Update assignment name display
                const selectedTask = tasks.find(task => task.assignmentCode === value);
                setSelectedAssignmentName(selectedTask ? selectedTask.assignmentName : 'Assignment name not found');

                // Check uniqueness against the selected student
                if (currentFormData.studentId) {
                    const alreadyGraded = existingGrades.some(
                        grade => grade.studentId === currentFormData.studentId && grade.assignmentCode === value
                    );
                    if (alreadyGraded) {
                        error = 'This student already has a grade for this assignment.';
                    }
                } else {
                    // Cannot check uniqueness without a student selected
                    error = 'Please select a student first to check grade uniqueness.';
                }
            }
        } else if (name === 'grade') {
            const gradeNum = Number(value);
            if (value === '' || value === null) {
                error = 'Grade is required.';
            } else if (isNaN(gradeNum)) {
                error = 'Grade must be a number.';
            } else if (gradeNum < 0 || gradeNum > 100) {
                error = 'Grade must be between 0 and 100.';
            } else if (!Number.isInteger(gradeNum)) {
                 // Optional: Enforce whole numbers if desired
                 // error = 'Grade must be a whole number.';
            }
        }
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        return error; // Return the error message for immediate use (e.g., in handleSubmit)
    };

    // Handle input changes for all fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        // Trigger validation for the changed field and update related state (like assignment name)
        validateField(name, value, newFormData);

        // Clear general submit status messages when user starts typing/changing selections
        setSubmitStatus({ error: '', success: '' });
    };

    // Handle blur event for validation feedback after user leaves a field
    const handleBlur = (e) => {
        const { name, value } = e.target;
        // Re-validate using the current form data state
        validateField(name, value, formData);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitStatus({ error: '', success: '' }); // Clear previous messages

        // Re-validate all fields on submit to catch any missed validations
        const studentIdError = validateField('studentId', formData.studentId, formData);
        const assignmentCodeError = validateField('assignmentCode', formData.assignmentCode, formData);
        const gradeError = validateField('grade', formData.grade, formData);

        // Check if any validation errors exist (either from direct validation or state)
        const hasErrors = studentIdError || assignmentCodeError || gradeError ||
                          Object.values(errors).some(err => !!err); // Check state too

        if (hasErrors) {
            setSubmitStatus({ error: 'Please fix the errors above before submitting.', success: '' });
            return;
        }

        // Double-check if student or task lists are empty (should be caught by loading state/initial check, but good safeguard)
         if (students.length === 0 || tasks.length === 0) {
             setSubmitStatus({ error: 'Cannot submit grade. Missing student or assignment data.', success: '' });
             return;
         }

        // Construct the grade object to be saved
        const newGrade = {
            studentId: formData.studentId,
            assignmentCode: formData.assignmentCode,
            assignmentName: selectedAssignmentName, // Include the name fetched earlier
            grade: Number(formData.grade), // Store grade as a number
            dateGraded: new Date().toISOString(), // Add a timestamp for when it was graded
        };

        console.log('Submitting Grade:', newGrade);

        try {
            const existingGrades = getStoredGrades();
            const updatedGrades = [...existingGrades, newGrade];
            saveGradesToStorage(updatedGrades);

            setSubmitStatus({ error: '', success: 'Grade saved successfully!' });
            setFormData(initialFormData); // Reset form fields
            setSelectedAssignmentName(''); // Reset displayed assignment name
            setErrors({}); // Clear validation errors state

            // Optional: Navigate away after a short delay or immediately
            // setTimeout(() => navigate('/GradeManage'), 1500); // Example: Navigate to a grade list view
            // navigate('/GradeManage'); // Navigate immediately

        } catch (err) {
            console.error("GradeForm: Error saving grade:", err);
            setSubmitStatus({ error: err.message || 'Failed to save grade. Please try again.', success: '' });
        }
    };

    // Handle cancel action
    const handleCancel = () => {
        navigate(-1); // Go back to the previous page in history
    };

    // Display loading spinner while fetching initial data
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', p: 3 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading student and assignment data...</Typography>
            </Box>
        );
    }

    // Render the form
    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate // Disable browser's default validation, rely on custom validation
            sx={{
                display: 'flex', flexDirection: 'column', gap: 3, // Spacing between elements
                maxWidth: 600, // Limit form width
                margin: 'auto', // Center the form
                p: { xs: 2, sm: 3 }, // Padding responsive
                border: '1px solid', borderColor: 'divider',
                borderRadius: 2, // Rounded corners
                mt: 4, // Margin top
            }}
        >
            <Typography variant="h5" component="h2" gutterBottom>
                Enter New Grade
            </Typography>

            {/* Student ID Select Dropdown */}
            <FormControl fullWidth required error={!!errors.studentId}>
                <InputLabel id="studentId-label">Student ID</InputLabel>
                <Select
                    labelId="studentId-label"
                    id="studentId"
                    name="studentId" // Matches key in formData state
                    value={formData.studentId}
                    label="Student ID" // Required for InputLabel association
                    onChange={handleInputChange}
                    onBlur={handleBlur} // Validate on blur
                    disabled={students.length === 0} // Disable if no students loaded
                >
                    <MenuItem value="" disabled><em>-- Select Student --</em></MenuItem>
                    {students.map(student => (
                        // Ensure student object has 'id' and 'name' properties
                        <MenuItem key={student.id} value={student.id}>
                            {/* Display student ID and Name for clarity */}
                            {student.id} ({student.name || 'Name Missing'})
                        </MenuItem>
                    ))}
                </Select>
                {/* Display validation error or helper text */}
                <FormHelperText>{errors.studentId || (students.length === 0 ? 'No students available to select.' : ' ')}</FormHelperText>
            </FormControl>

            {/* Assignment Code Select Dropdown */}
            <FormControl fullWidth required error={!!errors.assignmentCode}>
                <InputLabel id="assignmentCode-label">Assignment Code</InputLabel>
                <Select
                    labelId="assignmentCode-label"
                    id="assignmentCode"
                    name="assignmentCode" // Matches key in formData state
                    value={formData.assignmentCode}
                    label="Assignment Code"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    // Disable if no tasks loaded OR if no student is selected yet (needed for uniqueness check)
                    disabled={tasks.length === 0 || !formData.studentId}
                >
                    <MenuItem value="" disabled><em>-- Select Assignment --</em></MenuItem>
                    {tasks.map(task => (
                        // Ensure task object has 'assignmentCode'
                        <MenuItem key={task.assignmentCode} value={task.assignmentCode}>
                            {task.assignmentCode}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText>{errors.assignmentCode || (tasks.length === 0 ? 'No assignments available.' : (!formData.studentId ? 'Select a student first.' : ' '))}</FormHelperText>
            </FormControl>

            {/* Assignment Name Display (Read-Only) */}
            {/* Only show this field if an assignment code is selected */}
            {formData.assignmentCode && (
                <TextField
                    id="assignmentName"
                    name="assignmentName"
                    label="Assignment Name"
                    value={selectedAssignmentName || 'Loading name...'} // Show fetched name
                    fullWidth
                    InputProps={{
                        readOnly: true, // Make it non-editable
                    }}
                    variant="filled" // Use 'filled' or 'outlined' - 'filled' visually separates it
                    sx={{ mt: -1 }} // Adjust margin slightly if needed due to gap
                />
            )}

            {/* Assignment Grade Input */}
            <TextField
                id="grade"
                name="grade" // Matches key in formData state
                label="Assignment Grade"
                type="number" // Use number type for better input experience on mobile/validation
                value={formData.grade}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                fullWidth
                error={!!errors.grade}
                helperText={errors.grade || 'Enter a value between 0 and 100'}
                inputProps={{
                    min: 0,  // HTML5 min attribute
                    max: 100, // HTML5 max attribute
                    step: "any" // Allow decimals if needed, or set to "1" for integers only
                }}
                // Disable until an assignment is selected
                disabled={!formData.assignmentCode}
            />

            {/* General Submission Status Messages */}
            {submitStatus.error && (
                <Alert severity="error" sx={{ mt: 1 }}>{submitStatus.error}</Alert>
            )}
            {submitStatus.success && (
                <Alert severity="success" sx={{ mt: 1 }}>{submitStatus.success}</Alert>
            )}

            {/* Action Buttons (Cancel and Save) */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button variant="outlined" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    // Disable submit button if loading, if required data is missing,
                    // or if there are known validation errors in the state
                    disabled={isLoading || students.length === 0 || tasks.length === 0 || Object.values(errors).some(e => !!e)}
                >
                    Save Grade
                </Button>
            </Box>
        </Box>
    );
}
