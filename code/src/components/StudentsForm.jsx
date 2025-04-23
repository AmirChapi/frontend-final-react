// StudentsForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  Paper, // Import Paper for styling
  Stack, // Import Stack for button layout
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

export default function StudentsForm() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- Get student data from location state ---
  const studentToEdit = location.state?.studentToEdit || null;
  // --- End Get student data ---

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    gender: '',
    year: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}); // Keep touched state
  const [existingIDs, setExistingIDs] = useState([]);

  // --- Effect to load existing IDs and populate form for editing ---
  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem('studentsList')) || [];
    // Exclude the current student's ID if editing
    const ids = storedStudents
      .filter(student => !studentToEdit || student.id !== studentToEdit.id)
      .map(student => student.id);
    setExistingIDs(ids);

    if (studentToEdit) {
      setFormData(studentToEdit);
      // Mark all fields as touched initially when editing to show potential initial errors
      const initialTouched = Object.keys(studentToEdit).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(initialTouched);
      // Optionally validate all fields on load when editing
      // validateAllFields(studentToEdit); // Pass initial data to validation
    } else {
      // Reset form if adding a new student
      setFormData({ id: '', name: '', age: '', gender: '', year: '' });
      setTouched({});
      setErrors({});
    }
    // Depend on studentToEdit to re-run if navigating between add/edit
  }, [studentToEdit]); // Removed location.state, studentToEdit is derived from it

  // --- Validation function for a single field ---
  const validateField = (name, value, currentFormData = formData) => {
    let errorMsg = '';
    const dataToValidate = { ...currentFormData, [name]: value }; // Use potentially updated value

    switch (name) {
      case 'id':
        if (!value) {
          errorMsg = 'ID is required';
        } else if (!/^[0-9]{9}$/.test(value)) {
          errorMsg = 'ID must be exactly 9 digits';
        } else if (!studentToEdit && existingIDs.includes(value)) { // Check only if adding
          errorMsg = 'ID already exists';
        }
        break;
      case 'name':
        if (!value) {
          errorMsg = 'Full name is required';
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
          errorMsg = 'Full name must contain only letters and spaces';
        }
        break;
      case 'age':
        const age = Number(value);
        if (!value) {
          errorMsg = 'Age is required';
        } else if (isNaN(age) || !Number.isInteger(age) || age <= 18) {
          errorMsg = 'Age must be a whole number greater than 18';
        }
        break;
      case 'gender':
        if (!value) {
          errorMsg = 'Please select a gender';
        }
        break;
      case 'year':
        const year = Number(value);
        const currentYear = new Date().getFullYear();
        if (!value) {
          errorMsg = 'Registration year is required';
        } else if (isNaN(year) || !/^\d{4}$/.test(value) || !Number.isInteger(year)) {
            errorMsg = 'Enter a valid 4-digit year';
        } else if (year <= 2020) {
          errorMsg = 'Registration year must be after 2020';
        } else if (year > currentYear) {
            errorMsg = `Registration year cannot be in the future (current: ${currentYear})`;
        }
        break;
      default:
        break;
    }
    // Update errors state for the specific field
    setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
    return !errorMsg; // Return true if valid, false otherwise
  };
  // --- End Validation function ---

  // --- Validate all fields (used for submit) ---
  const validateAllFields = (dataToValidate = formData) => {
    let isValid = true;
    const newErrors = {};
    const fieldsToValidate = ['id', 'name', 'age', 'gender', 'year'];

    fieldsToValidate.forEach(field => {
      // Reuse validateField logic but collect all errors
      if (!validateField(field, dataToValidate[field], dataToValidate)) {
          isValid = false;
          // Re-capture the error message set by validateField
          newErrors[field] = getValidationError(field, dataToValidate[field]); // Use helper
      }
    });

    setErrors(newErrors); // Set all errors at once
    return isValid;
  };

  // Helper to get validation message without setting state
  const getValidationError = (name, value) => {
      let errorMsg = '';
      // Simplified duplication of validation logic for immediate return
      switch (name) {
        case 'id':
          if (!value) errorMsg = 'ID is required';
          else if (!/^[0-9]{9}$/.test(value)) errorMsg = 'ID must be exactly 9 digits';
          else if (!studentToEdit && existingIDs.includes(value)) errorMsg = 'ID already exists';
          break;
        case 'name':
          if (!value) errorMsg = 'Full name is required';
          else if (!/^[A-Za-z\s]+$/.test(value)) errorMsg = 'Full name must contain only letters and spaces';
          break;
        case 'age':
          const age = Number(value);
          if (!value) errorMsg = 'Age is required';
          else if (isNaN(age) || !Number.isInteger(age) || age <= 18) errorMsg = 'Age must be a whole number greater than 18';
          break;
        case 'gender':
          if (!value) errorMsg = 'Please select a gender';
          break;
        case 'year':
          const year = Number(value);
          const currentYear = new Date().getFullYear();
          if (!value) errorMsg = 'Registration year is required';
          else if (isNaN(year) || !/^\d{4}$/.test(value) || !Number.isInteger(year)) errorMsg = 'Enter a valid 4-digit year';
          else if (year <= 2020) errorMsg = 'Registration year must be after 2020';
          else if (year > currentYear) errorMsg = `Registration year cannot be in the future (current: ${currentYear})`;
          break;
        default: break;
      }
      return errorMsg;
  }
  // --- End Validate all fields ---

  // --- Use name attribute for simpler handleChange with immediate validation ---
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    validateField(name, value); // Validate immediately
    // Mark as touched on change
    if (!touched[name]) {
        setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
    }
  };

  // --- Use name attribute for simpler handleBlur ---
  const handleBlur = (event) => {
    const { name, value } = event.target;
    // Ensure touched state is set
    if (!touched[name]) {
        setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
    }
    // Validate on blur as well
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mark all fields as touched to show errors on submit attempt
    setTouched({ id: true, name: true, age: true, gender: true, year: true });

    if (validateAllFields()) { // Validate all fields before submitting
      const stored = JSON.parse(localStorage.getItem('studentsList')) || [];
      let updated;
      if (studentToEdit) {
        // Update existing student
        updated = stored.map(s => s.id === formData.id ? { ...formData } : s);
      } else {
        // Add new student
        updated = [...stored, { ...formData }];
      }
      localStorage.setItem('studentsList', JSON.stringify(updated));
      navigate('/StudentsManage'); // Navigate back to the management page
    } else {
        console.log("Validation failed on submit", errors);
    }
  };

  // --- Cancel Handler ---
  const handleCancel = () => {
    // Optional: Add confirmation dialog if needed
    // const confirmCancel = window.confirm("Are you sure you want to cancel? Unsaved changes will be lost.");
    // if (confirmCancel) {
        navigate('/StudentsManage'); // Navigate back without saving
    // }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}> {/* Added Paper styling */}
        <Typography variant="h5" gutterBottom align="center">
          {studentToEdit ? 'Edit Student' : 'Add New Student'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}> {/* Use Box for form layout */}
          <TextField
            required
            label="ID Number"
            name="id" // Use name attribute
            value={formData.id}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            disabled={!!studentToEdit} // Disable only when editing
            error={!!errors.id} // Error state based on errors object
            helperText={errors.id || ''} // Display error message directly
            inputProps={{ maxLength: 9 }}
            // --- Use slotProps ---
            slotProps={{
              input: { 'aria-invalid': !!errors.id }, // Accessibility
              helperText: {
                sx: { // Style helper text based on error state
                  color: errors.id ? 'error.main' : 'text.secondary',
                  minHeight: '1.2em' // Reserve space to prevent layout shifts
                },
              },
            }}
            // --- End slotProps ---
          />
          <TextField
            required
            label="Full Name"
            name="name" // Use name attribute
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            error={!!errors.name}
            helperText={errors.name || ''}
            // --- Use slotProps ---
            slotProps={{
              input: { 'aria-invalid': !!errors.name },
              helperText: {
                sx: {
                  color: errors.name ? 'error.main' : 'text.secondary',
                  minHeight: '1.2em'
                },
              },
            }}
            // --- End slotProps ---
          />
          <TextField
            required
            label="Age"
            name="age" // Use name attribute
            type="number"
            value={formData.age}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            error={!!errors.age}
            helperText={errors.age || ''}
            inputProps={{ min: 19 }}
            // --- Use slotProps ---
            slotProps={{
              input: { 'aria-invalid': !!errors.age },
              helperText: {
                sx: {
                  color: errors.age ? 'error.main' : 'text.secondary',
                  minHeight: '1.2em'
                 },
              },
            }}
            // --- End slotProps ---
          />
          {/* --- Gender Radio Group --- */}
          <FormControl component="fieldset" fullWidth error={!!errors.gender} required>
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup
              row
              name="gender" // Use name attribute
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur} // Add onBlur to the group
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
            </RadioGroup>
            {/* Display error message below the group */}
            {errors.gender && (
              <Typography variant="caption" color="error" sx={{ pl: 2, mt: -1, minHeight: '1.2em' }}>
                {errors.gender}
              </Typography>
            )}
          </FormControl>
          {/* --- End Gender Radio Group --- */}
          <TextField
            required
            label="Registration Year"
            name="year" // Use name attribute
            type="number"
            value={formData.year}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            error={!!errors.year}
            helperText={errors.year || ''}
            inputProps={{ min: 2021 }}
            // --- Use slotProps ---
            slotProps={{
              input: { 'aria-invalid': !!errors.year },
              helperText: {
                sx: {
                  color: errors.year ? 'error.main' : 'text.secondary',
                  minHeight: '1.2em'
                 },
              },
            }}
            // --- End slotProps ---
          />
          {/* --- Buttons using Stack for layout --- */}
          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 2 }}>
              <Button
                  variant="outlined"
                  onClick={handleCancel}
                  color="secondary"
              >
                  Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                  {studentToEdit ? 'Save Changes' : 'Add Student'}
              </Button>
          </Stack>
          {/* --- End Buttons --- */}
        </Box>
      </Paper>
    </Box>
  );
}
