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
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
  


export default function StudentsForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const studentToEdit = location.state?.studentToEdit || null;

  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    age: '',
    gender: '',
    year: '',
  });

  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [existingIDs, setExistingIDs] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem('students')) || [];
    setStudents(storedStudents);
    setExistingIDs(storedStudents.map((s) => s.studentId));

    if (studentToEdit) {
      setFormData({ ...studentToEdit });
    }
  }, [studentToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let errorField = false;
    const currentYear = new Date().getFullYear();

    if (name === 'studentId') {
      errorField =
        !(value.length === 9 && /^[0-9]+$/.test(value)) ||
        (!studentToEdit && existingIDs.includes(value));
    }

    if (name === 'fullName') {
      errorField = !value.trim() || !/^[A-Za-z\s]+$/.test(value);
    }

    if (name === 'age') {
      const age = Number(value);
      errorField = !(value && Number.isInteger(age) && age >= 18 && age <= 80);
    }

    if (name === 'gender') {
      errorField = !value;
    }

    if (name === 'year') {
      const year = Number(value);
      errorField = !(value.length === 4 && Number.isInteger(year) && year > 2019 && year <= currentYear);
    }

    setErrors((prev) => ({ ...prev, [name]: errorField }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!(formData.studentId.length === 9 && /^[0-9]+$/.test(formData.studentId)) ||
        (!studentToEdit && existingIDs.includes(formData.studentId))) {
      newErrors.studentId = true;
      hasError = true;
    }

    if (!formData.fullName.trim() || !/^[A-Za-z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = true;
      hasError = true;
    }

    const age = Number(formData.age);
    if (!(formData.age && Number.isInteger(age) && age >= 18 && age <= 80)) {
      newErrors.age = true;
      hasError = true;
    }

    if (!formData.gender) {
      newErrors.gender = true;
      hasError = true;
    }

    const year = Number(formData.year);
    if (!(formData.year.length === 4 && Number.isInteger(year) && year >= 2020 && year <= currentYear)) {
      newErrors.year = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }
    
     //זה מה ששינתי
   
      addStudent(student).then(() => {
      navigate("/StudentsManage");
      });
      
    setOpenSnackbar(true);
    setTimeout(() => navigate('/StudentsManage'), 1000);
  };

  const handleCancelClick = () => {
    setOpenCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate('/StudentsManage');
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom align="center">
          {studentToEdit ? 'Edit Student' : 'Add New Student'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            label="Student ID"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            fullWidth
            disabled={!!studentToEdit}
            error={errors.studentId}
            helperText={
              errors.studentId
                ? existingIDs.includes(formData.studentId) && !studentToEdit
                  ? 'This ID already exists'
                  : 'ID must be exactly 9 digits'
                : ''
            }
            slotProps={{input: {maxLength: 9,},}}
          />

          <TextField
            required
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            fullWidth
            error={errors.fullName}
            helperText={errors.fullName ? 'Only letters and spaces allowed' : ''}
          />

          <TextField
            required
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            fullWidth
            error={errors.age}
            helperText={errors.age ? 'Must be a whole number greater than 18 or less than 80' : ''}
          />

          <FormControl component="fieldset" fullWidth error={errors.gender} required>
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup
              row
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
            </RadioGroup>
            {errors.gender && (
              <Typography variant="caption" color="error" sx={{ pl: 2, mt: -1 }}>
                Please select a gender
              </Typography>
            )}
          </FormControl>

          <TextField
            required
            label="Registration Year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            fullWidth
            error={errors.year}
            helperText={errors.year ? 'Year must be after 2019 and not in the future' : ''}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={handleCancelClick} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={handleCloseSnackbar}>
          Student successfully saved!
        </Alert>
      </Snackbar>

      {/* Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel? Unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmCancel} color="secondary" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
