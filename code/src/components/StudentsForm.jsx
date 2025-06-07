import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, RadioGroup,
  FormControlLabel, Radio, FormLabel, FormControl,
  Paper, Snackbar, Alert, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { addStudent, updateStudent, getStudent, listStudent } from '../firebase/student';

export default function StudentsForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    age: '',
    gender: '',
    year: '',
  });

  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (isEditMode) {
        const student = await getStudent(id);
        if (student) setFormData(student);
      } else {
        const students = await listStudent();
        setAllStudents(students);
      }
    };
    loadData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();
    const age = Number(formData.age);
    const year = Number(formData.year);

    if (!/^\d{9}$/.test(formData.studentId)) {
      newErrors.studentId = 'Must be exactly 9 digits';
    } else if (
      !isEditMode &&
      allStudents.some((s) => s.studentId === formData.studentId)
    ) {
      newErrors.studentId = 'This ID already exists in the system';
    }

    if (!formData.fullName.trim() || !/^[A-Za-z\s]+$/.test(formData.fullName))
      newErrors.fullName = 'Only letters and spaces allowed';

    if (!age || age < 18 || age > 80)
      newErrors.age = 'Must be 18–80';

    if (!formData.gender)
      newErrors.gender = 'Please select gender';

    if (!year || year < 2020 || year > currentYear)
      newErrors.year = 'Year must be between 2020 and current';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditMode) {
      await updateStudent({ ...formData, id });
    } else {
      await addStudent(formData);
    }

    setOpenSnackbar(true);
    navigate('/StudentsManage');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        mt: 6,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          pt: 2,
          pb: 4,
          px: 4,
          width: 400,
          backgroundColor: '#ffffff',
          borderRadius: 2,
          border: '2px solid #c0aa92',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          {isEditMode ? 'Edit Student' : 'Add New Student'}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Student ID"
            name="studentId"
            fullWidth
            required
            value={formData.studentId}
            onChange={handleChange}
            disabled={isEditMode}
            error={!!errors.studentId}
            helperText={errors.studentId}
          />

          <TextField
            label="Full Name"
            name="fullName"
            fullWidth
            required
            value={formData.fullName}
            onChange={handleChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
          />

          <TextField
            label="Age"
            name="age"
            type="number"
            fullWidth
            required
            value={formData.age}
            onChange={handleChange}
            error={!!errors.age}
            helperText={errors.age}
          />

          <FormControl fullWidth required error={!!errors.gender}>
            <FormLabel>Gender</FormLabel>
            <RadioGroup
              row
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Male"
                control={<Radio />}
                label="Male"
              />
              <FormControlLabel
                value="Female"
                control={<Radio />}
                label="Female"
              />
            </RadioGroup>
            {errors.gender && (
              <Typography color="error" variant="caption">
                {errors.gender}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Registration Year"
            name="year"
            type="number"
            fullWidth
            required
            value={formData.year}
            onChange={handleChange}
            error={!!errors.year}
            helperText={errors.year}
          />

          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}
          >
            <Button
              variant="contained"
              onClick={() => setOpenCancelDialog(true)}
              sx={{
                backgroundColor: '#bb2f13',
                color: '#f5f5f5',
                borderRadius: '20px',
                fontWeight: 400,
                textTransform: 'none',
                '&:hover': {
                  color: '#000000',
                  fontWeight: 700,
                  backgroundColor: '#bb2f13',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#ebdfd1',
                color: '#000',
                borderRadius: '20px',
                fontWeight: 400,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#c0aa92',
                  fontWeight: 700,
                },
              }}
            >
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Student successfully saved!
        </Alert>
      </Snackbar>

      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
      >
        <DialogTitle>Cancel Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure? Unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} color="primary">
            No
          </Button>
          <Button
            onClick={() => navigate('/StudentsManage')}
            color="secondary"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
