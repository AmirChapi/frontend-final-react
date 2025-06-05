// StudentsForm.jsx - טופס הוספת/עריכת סטודנט עם URL ID
import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, RadioGroup,
  FormControlLabel, Radio, FormLabel, FormControl,
  Paper, Snackbar, Alert, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { addStudent, updateStudent, getStudent } from '../firebase/student';

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

  useEffect(() => {
    const loadStudent = async () => {
      if (isEditMode) {
        const student = await getStudent(id);
        if (student) setFormData(student);
      }
    };
    loadStudent();
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

    if (!/^\d{9}$/.test(formData.studentId)) newErrors.studentId = true;
    if (!formData.fullName.trim() || !/^[A-Za-z\s]+$/.test(formData.fullName)) newErrors.fullName = true;
    if (!age || age < 18 || age > 80) newErrors.age = true;
    if (!formData.gender) newErrors.gender = true;
    if (!year || year < 2020 || year > currentYear) newErrors.year = true;

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
    <Box sx={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' , backgroundColor: '#add8e6' }}>
      <Paper elevation={3} sx={{ p: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {isEditMode ? 'Edit Student' : 'Add New Student'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Student ID" name="studentId" fullWidth required
            value={formData.studentId} onChange={handleChange}
            disabled={isEditMode} error={errors.studentId}
            helperText={errors.studentId && 'Must be exactly 9 digits'}
          />
          <TextField
            label="Full Name" name="fullName" fullWidth required
            value={formData.fullName} onChange={handleChange}
            error={errors.fullName} helperText={errors.fullName && 'Only letters and spaces allowed'}
          />
          <TextField
            label="Age" name="age" type="number" fullWidth required
            value={formData.age} onChange={handleChange}
            error={errors.age} helperText={errors.age && 'Must be 18–80'}
          />
          <FormControl fullWidth required error={errors.gender}>
            <FormLabel>Gender</FormLabel>
            <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
            </RadioGroup>
            {errors.gender && <Typography color="error" variant="caption">Please select gender</Typography>}
          </FormControl>
          <TextField
            label="Registration Year" name="year" type="number" fullWidth required
            value={formData.year} onChange={handleChange}
            error={errors.year} helperText={errors.year && 'Year must be 2020–current'}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" color="secondary" onClick={() => setOpenCancelDialog(true)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Save</Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>Student successfully saved!</Alert>
      </Snackbar>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure? Unsaved changes will be lost.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} color="primary">No</Button>
          <Button onClick={() => navigate('/StudentsManage')} color="secondary">Yes, Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
