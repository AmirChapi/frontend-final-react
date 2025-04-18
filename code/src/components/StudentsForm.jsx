// src/components/StudentsForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText'; // Import FormHelperText
import Alert from '@mui/material/Alert'; // Import Alert for feedback

// --- LocalStorage Key ---
const STUDENTS_STORAGE_KEY = 'studentsList';

// --- Static Placeholder Students ---
const placeholderStudents = Array.from({ length: 10 }, (_, i) => ({
    id: `${2000 + i}`, // Example IDs: "2000", "2001", ...
    fullName: `Student Name ${i + 1}`,
    age: `${20 + i}`, // Example ages: "20", "21", ...
    gender: i % 3 === 0 ? 'female' : (i % 3 === 1 ? 'male' : 'other'), // Cycle through genders
    year: `${new Date().getFullYear() - (i % 3)}`, // Cycle through last 3 years as strings
}));

// --- Helper Functions for LocalStorage ---
const getStoredStudents = () => {
    try {
        const storedData = localStorage.getItem(STUDENTS_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            // Basic check to ensure it's an array before returning
            if (Array.isArray(parsedData)) {
                console.log("StudentsForm: Found students in localStorage.");
                return parsedData;
            } else {
                 console.warn("StudentsForm: Data in localStorage is not an array. Re-initializing.");
                 return null; // Treat non-array data as invalid
            }
        }
    } catch (error) {
        console.error("StudentsForm: Error parsing students from localStorage:", error);
    }
    console.log("StudentsForm: No valid students found in localStorage.");
    return null; // Return null if nothing found, error occurred, or data was invalid
};

const saveStudentsToStorage = (students) => {
    try {
        // Ensure we are saving an array
        if (!Array.isArray(students)) {
            console.error("StudentsForm: Attempted to save non-array data to localStorage.");
            return; // Prevent saving invalid data
        }
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
        console.log("StudentsForm: Saved students to localStorage.");
    } catch (error) {
        console.error("StudentsForm: Failed to save students to localStorage:", error);
        // Optionally, inform the user about the error via state update
        // setSubmitStatus({ error: 'Failed to save data.', success: '' });
    }
};
// --- End Helper Functions ---

// Initial state for the form
const initialFormData = {
    id: '',
    fullName: '',
    age: '',
    gender: '',
    year: '',
};

export default function StudentRegistrationForm() {
    const navigate = useNavigate(); // Hook for navigation
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState({ error: '', success: '' });

    // --- Check and Initialize LocalStorage on Mount ---
    useEffect(() => {
        const existingStudents = getStoredStudents();
        // If null is returned (no data, error, or invalid data), initialize.
        if (existingStudents === null) {
            console.log("StudentsForm: Initializing localStorage with placeholder students.");
            saveStudentsToStorage(placeholderStudents);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Validation ---
    const validateField = (name, value) => {
        let error = '';
        // Get current students for uniqueness check
        const students = getStoredStudents() || [];

        if (name === 'id') {
            if (!value.trim()) error = 'Student ID is required.';
            else if (!/^\d+$/.test(value)) error = 'Student ID must contain only numbers.';
            // Check for uniqueness only if ID is valid format
            else if (students.some(student => student.id === value.trim())) {
                error = 'Student ID already exists.';
            }
        } else if (name === 'fullName') {
            if (!value.trim()) error = 'Full Name is required.';
            // You could add more specific name validation if needed (e.g., regex for characters)
        } else if (name === 'age') {
            const ageNum = Number(value);
            if (!value.trim()) error = 'Age is required.';
            else if (!/^\d+$/.test(value) || ageNum <= 0 || ageNum > 120) {
                error = 'Please enter a valid age (1-120).';
            }
        } else if (name === 'gender') {
            if (!value) error = 'Gender is required.';
        } else if (name === 'year') {
            const yearNum = Number(value);
            const currentFullYear = new Date().getFullYear();
            if (!value.trim()) error = 'Year is required.';
            else if (!/^\d{4}$/.test(value)) error = 'Please enter a valid 4-digit year.';
            // Optional: Add a reasonable range check for the year
            else if (yearNum < 1900 || yearNum > currentFullYear + 1) {
                 error = `Year must be between 1900 and ${currentFullYear + 1}.`;
            }
        }
        // Update errors state
        setErrors(prev => ({ ...prev, [name]: error }));
        return error; // Return error for immediate check in handleSubmit
    };

    // --- Input Handlers ---
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for the field being edited, or re-validate
        if (errors[name]) {
            validateField(name, value); // Re-validate on change
        }
        setSubmitStatus({ error: '', success: '' }); // Clear submit status on input change
    };

    // Validate when the user leaves the field
    const handleBlur = (event) => {
        const { name, value } = event.target;
        validateField(name, value);
    };

    // --- Form Submission ---
    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitStatus({ error: '', success: '' }); // Reset status

        // Validate all fields before submitting
        const idError = validateField('id', formData.id);
        const nameError = validateField('fullName', formData.fullName);
        const ageError = validateField('age', formData.age);
        const genderError = validateField('gender', formData.gender);
        const yearError = validateField('year', formData.year);

        // Check if any validation returned an error message
        if (idError || nameError || ageError || genderError || yearError) {
            setSubmitStatus({ error: 'Please fix the errors above.', success: '' });
            return; // Stop submission if errors exist
        }

        // Prepare the new student object (ensure data types are consistent, e.g., strings)
        const newStudent = {
            id: formData.id.trim(), // Trim whitespace
            fullName: formData.fullName.trim(),
            age: formData.age.trim(), // Keep as string to match placeholders
            gender: formData.gender,
            year: formData.year.trim(), // Keep as string
        };

        console.log('Registering New Student:', newStudent);

        try {
            // Get the current list, default to empty array if null/error
            const existingStudents = getStoredStudents() || [];
            // Create the updated list
            const updatedStudents = [...existingStudents, newStudent];
            // Save the updated list back to localStorage
            saveStudentsToStorage(updatedStudents);

            setSubmitStatus({ error: '', success: 'Student registered successfully!' });

            // Clear the form fields back to initial state
            setFormData(initialFormData);
            setErrors({}); // Clear any previous validation errors

            // Optional: Navigate back to the student management page after success
            // Consider navigating immediately or after a short delay
            // navigate('/StudentsManage');
            setTimeout(() => navigate('/StudentsManage'), 1500); // Navigate after 1.5 seconds

        } catch (err) {
            // This catch block might be redundant if saveStudentsToStorage handles its errors
            // but can catch other unexpected errors during the process.
            console.error("StudentsForm: Error during submission process:", err);
            setSubmitStatus({ error: 'Failed to register student. Please try again.', success: '' });
        }
    };

    // --- Cancel Handler ---
    const handleCancel = () => {
        // Navigate back, maybe to the list view or home page
        navigate('/StudentsManage'); // Or navigate(-1) to go back one step
    };


    return (
        <Box
            component="form"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2.5, // Adjusted gap for better spacing
                maxWidth: 500, // Limit form width for readability
                margin: 'auto', // Center the form horizontally
                p: { xs: 2, sm: 3 }, // Responsive padding
                border: '1px solid', borderColor: 'divider', // Subtle border
                borderRadius: 2, // Rounded corners
                mt: 4, // Margin top
            }}
            noValidate // Disable default HTML5 validation, rely on custom
            autoComplete="off" // Disable browser autocomplete suggestions
            onSubmit={handleSubmit}
        >
            <Typography variant="h5" component="h1" gutterBottom>
                Student Registration
            </Typography>

            {/* Student ID */}
            <TextField
                required
                fullWidth // Make field take full width of container
                id="student-id"
                name="id" // Matches key in formData state
                label="Student ID"
                value={formData.id}
                onChange={handleInputChange}
                onBlur={handleBlur} // Validate on blur
                error={!!errors.id} // Show error state if error message exists
                helperText={errors.id || ' '} // Display error message or reserve space
                // Consider inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} for mobile keyboards
            />

            {/* Full Name */}
            <TextField
                required
                fullWidth
                id="full-name"
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.fullName}
                helperText={errors.fullName || ' '}
            />

            {/* Age */}
            <TextField
                required
                fullWidth
                id="age"
                name="age"
                label="Age"
                type="number" // Use number type for semantics and potential input controls
                value={formData.age}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.age}
                helperText={errors.age || ' '}
                inputProps={{ min: 1, max: 120 }} // Basic range hint
            />

            {/* Gender */}
            <FormControl component="fieldset" required error={!!errors.gender} sx={{ alignSelf: 'flex-start', width: '100%' }}> {/* Align label left */}
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                    row // Display radio buttons in a row
                    aria-label="gender"
                    name="gender" // Matches key in formData state
                    value={formData.gender}
                    onChange={handleInputChange}
                    // onBlur={handleBlur} // Blur on RadioGroup might not be standard, handled by onChange
                >
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
                {/* Display error message specifically for gender */}
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
            </FormControl>

            {/* Year */}
            <TextField
                required
                fullWidth
                id="year"
                name="year"
                label="Registration Year"
                type="number" // Use number type
                value={formData.year}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.year}
                helperText={errors.year || 'Enter the 4-digit registration year'}
                inputProps={{
                     min: 1900, // Example minimum year
                     max: new Date().getFullYear() + 1 // Example maximum year
                }}
            />

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
                    // Disable button if there are known errors in the state
                    disabled={Object.values(errors).some(e => !!e)}
                 >
                    Register Student
                </Button>
            </Box>
        </Box>
    );
}
