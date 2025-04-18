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
const STUDENTS_STORAGE_KEY = 'studentsList';

// --- Static Placeholder Students (Adjusted - Email Removed) ---
const placeholderStudents = Array.from({ length: 5 }, (_, i) => ({
    id: `${100000000 + i}`, // Example 9-digit IDs
    name: `Placeholder Student ${i + 1}`,
    // email: `student${i + 1}@placeholder.edu`, // Removed email
    year: `${2020 + (i % 4)}`, // Example year >= 2020
}));

// --- Helper Functions for LocalStorage (Keep as they are) ---
const getStoredStudents = () => {
    try {
        const storedData = localStorage.getItem(STUDENTS_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData)) {
                return parsedData;
            } else {
                 console.warn("StudentsForm: Data in localStorage is not an array. Re-initializing.");
                 return null;
            }
        }
    } catch (error) {
        console.error("StudentsForm: Error parsing students from localStorage:", error);
    }
    return null;
};

const saveStudentsToStorage = (students) => {
    try {
        if (!Array.isArray(students)) {
            console.error("StudentsForm: Attempted to save non-array data to localStorage.");
            return;
        }
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
        console.error("StudentsForm: Failed to save students to localStorage:", error);
    }
};
// --- End Helper Functions ---

// Initial state for the form (Email Removed)
const initialFormData = {
    id: '',
    name: '',
    // email: '', // Removed email
    age: '',
    gender: '',
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
            saveStudentsToStorage(placeholderStudents);
        }
    }, []);

    // --- Updated Validation (Email Case Removed) ---
    const validateField = (name, value) => {
        let error = '';
        const trimmedValue = value.trim();
        const students = getStoredStudents() || [];

        switch (name) {
            case 'id':
                if (!trimmedValue) {
                    error = 'Student ID is required.';
                } else if (!/^\d{9}$/.test(trimmedValue)) {
                    error = 'Student ID must be exactly 9 digits.';
                } else if (students.some(student => student.id === trimmedValue)) {
                    error = 'Student ID already exists.';
                }
                break;

            case 'name':
                if (!trimmedValue) {
                    error = 'Full Name is required.';
                } else if (!/^[a-zA-Z\s]+$/.test(trimmedValue)) {
                    error = 'Full Name must contain only letters and spaces.';
                }
                break;

            // case 'email': // Removed email validation case
            //     // ...
            //     break;

            case 'age':
                const ageNum = Number(trimmedValue);
                if (!trimmedValue) {
                    error = 'Age is required.';
                } else if (isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum <= 18) {
                    error = 'Age must be a whole number greater than 18.';
                }
                break;

            case 'gender':
                if (!value) {
                    error = 'Gender is required.';
                }
                break;

            case 'year':
                const yearNum = Number(trimmedValue);
                const currentFullYear = new Date().getFullYear();
                if (!trimmedValue) {
                    error = 'Registration Year is required.';
                } else if (!/^\d{4}$/.test(trimmedValue)) {
                    error = 'Please enter a valid 4-digit year.';
                } else if (isNaN(yearNum) || yearNum < 2020 || yearNum > currentFullYear + 1) {
                    error = `Year must be between 2020 and ${currentFullYear + 1}.`;
                }
                break;

            default:
                break;
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

    // --- Form Submission (Email Removed from checks and newStudent object) ---
    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitStatus({ error: '', success: '' });

        const validationErrors = {};
        let formIsValid = true;
        // Use Object.keys on initialFormData to ensure all expected fields are validated
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
            return;
        }

        // Prepare the new student object (Email Removed)
        const newStudent = {
            id: formData.id.trim(),
            name: formData.name.trim(),
            // email: formData.email.trim(), // Removed email
            year: formData.year.trim(),
            // Age and Gender are validated but not saved
        };

        console.log('Registering New Student (Table Structure - No Email):', newStudent);

        try {
            const existingStudents = getStoredStudents() || [];
            // Updated uniqueness check (Email Removed)
            if (existingStudents.some(s => s.id === newStudent.id)) {
                 setSubmitStatus({ error: 'Student ID already exists. Please check your input.', success: '' });
                 validateField('id', formData.id); // Re-run validation to highlight ID field
                 return;
            }

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

    // --- Cancel Handler ---
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
                label="Student ID (9 digits)"
                value={formData.id}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.id}
                helperText={errors.id || ' '}
                inputProps={{
                    maxLength: 9,
                    inputMode: 'numeric',
                    pattern: '\\d*',
                 }}
            />

            {/* Full Name */}
            <TextField
                required
                fullWidth
                id="full-name"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.name}
                helperText={errors.name || ' '}
            />

            {/* Email Field (Removed) */}
            {/*
            <TextField
                required
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.email}
                helperText={errors.email || ' '}
            />
            */}

            {/* Age */}
            <TextField
                required
                fullWidth
                id="age"
                name="age"
                label="Age (Must be over 18)"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.age}
                helperText={errors.age || ' '}
                inputProps={{
                    min: 19,
                    step: 1,
                }}
            />

            {/* Gender */}
            <FormControl component="fieldset" required error={!!errors.gender} sx={{ alignSelf: 'flex-start', width: '100%' }}>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                    row
                    aria-label="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                >
                    <FormControlLabel value="female" control={<Radio required />} label="Female" />
                    <FormControlLabel value="male" control={<Radio required />} label="Male" />
                    <FormControlLabel value="other" control={<Radio required />} label="Other" />
                </RadioGroup>
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
            </FormControl>

            {/* Registration Year */}
            <TextField
                required
                fullWidth
                id="year"
                name="year"
                label="Registration Year (2020 onwards)"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={!!errors.year}
                helperText={errors.year || 'Enter a 4-digit year'}
                inputProps={{
                     min: 2020,
                     max: new Date().getFullYear() + 1,
                     step: 1,
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
                    disabled={!Object.values(formData).some(v => v !== '') || Object.values(errors).some(e => !!e)}
                 >
                    Register Student
                </Button>
            </Box>
        </Box>
    );
}
