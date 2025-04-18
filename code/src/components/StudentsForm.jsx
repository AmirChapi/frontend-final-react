
// src/components/StudentsForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';

// --- LocalStorage Key ---
const STUDENTS_STORAGE_KEY = 'studentsList'; // Ensure this matches StudentsManage.jsx

// --- Static Placeholder Students (Adjusted to match table structure) ---
const placeholderStudents = Array.from({ length: 5 }, (_, i) => ({
    id: `${2000 + i}`,
    name: `Placeholder Student ${i + 1}`, // Use 'name'
    email: `student${i + 1}@placeholder.edu`, // Add 'email'
    year: `${new Date().getFullYear() - (i % 2)}`, // Example year
    // Removed age/gender as they aren't in the Manage table
}));

// --- Helper Functions for LocalStorage (Keep as they are) ---
const getStoredStudents = () => {
    try {
        const storedData = localStorage.getItem(STUDENTS_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData)) {
                console.log("StudentsForm: Found students in localStorage.");
                return parsedData;
            } else {
                 console.warn("StudentsForm: Data in localStorage is not an array. Re-initializing.");
                 return null;
            }
        }
    } catch (error) {
        console.error("StudentsForm: Error parsing students from localStorage:", error);
    }
    console.log("StudentsForm: No valid students found in localStorage.");
    return null;
};

const saveStudentsToStorage = (students) => {
    try {
        if (!Array.isArray(students)) {
            console.error("StudentsForm: Attempted to save non-array data to localStorage.");
            return;
        }
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
        console.log("StudentsForm: Saved students to localStorage.");
    } catch (error) {
        console.error("StudentsForm: Failed to save students to localStorage:", error);
    }
};
// --- End Helper Functions ---

// Initial state for the form (Added email, changed fullName to name)
const initialFormData = {
    id: '',
    name: '', // Changed from fullName
    email: '', // Added email
    age: '',   // Keep for form logic if needed, but won't save to main list structure
    gender: '', // Keep for form logic if needed
    year: '',
};

export default function StudentRegistrationForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState({ error: '', success: '' });

    // --- Check and Initialize LocalStorage on Mount ---
    useEffect(() => {
        const existingStudents = getStoredStudents();
        if (existingStudents === null) {
            console.log("StudentsForm: Initializing localStorage with placeholder students.");
            // Initialize with placeholders that match the table structure
            saveStudentsToStorage(placeholderStudents);
        }
    }, []);

    // --- Validation ---
    const validateField = (name, value) => {
        let error = '';
        const students = getStoredStudents() || [];

        if (name === 'id') {
            if (!value.trim()) error = 'Student ID is required.';
            else if (!/^\d+$/.test(value)) error = 'Student ID must contain only numbers.';
            else if (students.some(student => student.id === value.trim())) {
                error = 'Student ID already exists.';
            }
        } else if (name === 'name') { // Changed from fullName
            if (!value.trim()) error = 'Full Name is required.';
        } else if (name === 'email') { // Added email validation
             if (!value.trim()) error = 'Email is required.';
             // Basic email format check (adjust regex as needed for stricter validation)
             else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                 error = 'Please enter a valid email address.';
             }
             // Optional: Check for email uniqueness
             else if (students.some(student => student.email === value.trim())) {
                 error = 'Email address already exists.';
             }
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
            else if (yearNum < 1900 || yearNum > currentFullYear + 1) {
                 error = `Year must be between 1900 and ${currentFullYear + 1}.`;
            }
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    // --- Input Handlers (No changes needed here) ---
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

    // --- Form Submission (Updated validation checks and newStudent object) ---
    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitStatus({ error: '', success: '' });

        // Validate all fields before submitting
        const idError = validateField('id', formData.id);
        const nameError = validateField('name', formData.name); // Use 'name'
        const emailError = validateField('email', formData.email); // Add 'email' validation check
        const ageError = validateField('age', formData.age); // Keep for form validation
        const genderError = validateField('gender', formData.gender); // Keep for form validation
        const yearError = validateField('year', formData.year);

        // Check if any validation returned an error message
        // Include emailError in the check
        if (idError || nameError || emailError || ageError || genderError || yearError) {
            setSubmitStatus({ error: 'Please fix the errors above.', success: '' });
            return;
        }

        // Prepare the new student object MATCHING THE TABLE STRUCTURE
        const newStudent = {
            id: formData.id.trim(),
            name: formData.name.trim(), // Use 'name' field
            email: formData.email.trim(), // Add 'email' field
            year: formData.year.trim(),
            // Do not include age/gender here as they aren't in the target structure for the table
        };

        console.log('Registering New Student (Table Structure):', newStudent);

        try {
            const existingStudents = getStoredStudents() || [];
            const updatedStudents = [...existingStudents, newStudent];
            saveStudentsToStorage(updatedStudents);

            setSubmitStatus({ error: '', success: 'Student registered successfully!' });
            setFormData(initialFormData);
            setErrors({});

            setTimeout(() => navigate('/StudentsManage'), 1500);

        } catch (err) {
            console.error("StudentsForm: Error during submission process:", err);
            setSubmitStatus({ error: 'Failed to register student. Please try again.', success: '' });
        }
    };

    // --- Cancel Handler (No changes needed) ---
    const handleCancel = () => {
        navigate('/StudentsManage');
    };


    return (
        <Box
            component="form"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2.5,
                maxWidth: 500,
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
                Student Registration
            </Typography>

            {/* Student ID */}
            <TextField
                required
                fullWidth
                id="student-id"
                name="id"
                label="Student ID"
                value={formData.id}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.id}
                helperText={errors.id || ' '}
            />

            {/* Full Name (Label remains 'Full Name', name attribute is 'name') */}
            <TextField
                required
                fullWidth
                id="full-name"
                name="name" // Use 'name' here to match state and validation
                label="Full Name"
                value={formData.name} // Bind to formData.name
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.name} // Check errors.name
                helperText={errors.name || ' '} // Show errors.name
            />

            {/* Email Field (New) */}
            <TextField
                required
                fullWidth
                id="email"
                name="email" // Use 'email'
                label="Email Address"
                type="email" // Use email type
                value={formData.email} // Bind to formData.email
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.email} // Check errors.email
                helperText={errors.email || ' '} // Show errors.email
            />

            {/* Age (Keep for form logic, but not saved in final student object for the table) */}
            <TextField
                required
                fullWidth
                id="age"
                name="age"
                label="Age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.age}
                helperText={errors.age || ' '}
                inputProps={{ min: 1, max: 120 }}
            />

            {/* Gender (Keep for form logic) */}
            <FormControl component="fieldset" required error={!!errors.gender} sx={{ alignSelf: 'flex-start', width: '100%' }}>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                    row
                    aria-label="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                >
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
            </FormControl>

            {/* Year */}
            <TextField
                required
                fullWidth
                id="year"
                name="year"
                label="Registration Year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.year}
                helperText={errors.year || 'Enter the 4-digit registration year'}
                inputProps={{
                     min: 1900,
                     max: new Date().getFullYear() + 1
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
                    // Update disabled check to include email
                    disabled={Object.values(errors).some(e => !!e)}
                 >
                    Register Student
                </Button>
            </Box>
        </Box>
    );
}

