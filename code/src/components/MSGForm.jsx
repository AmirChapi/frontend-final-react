// ✅ MSGForms.jsx - טופס הוספה / עריכה להודעות (לפי קורסים, ללא ID)
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';

export default function MSGForms() {
  const navigate = useNavigate();
  const location = useLocation();
  const messageToEdit = location.state?.messageToEdit || null;

  const initialValues = {
    messageCode: '',
    courseCode: '',
    courseName: '',
    assignmentName: '',
    messageContent: '',
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [courseOptions, setCourseOptions] = useState([]);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem('coursesList')) || [];
    setCourseOptions(storedCourses);

    if (messageToEdit) {
      setFormValues(messageToEdit);
    }
  }, [messageToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    let errorField = false;

    if (name === 'messageCode') {
      const messages = JSON.parse(localStorage.getItem('messages')) || [];
      const exists = messages.some(
        (msg) => msg.messageCode === value && (messageToEdit ? msg.messageCode !== messageToEdit.messageCode : true)
      );
      errorField = exists || !/^[a-zA-Z0-9]+$/.test(value);
    }

    if (name === 'messageContent') {
      errorField = !value.trim();
    }

    setErrors((prev) => ({ ...prev, [name]: errorField }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {};
    const messages = JSON.parse(localStorage.getItem('messages')) || [];

    const exists = messages.some(
      (msg) => msg.messageCode === formValues.messageCode && (messageToEdit ? msg.messageCode !== messageToEdit.messageCode : true)
    );

    if (!formValues.messageCode || exists || !/^[a-zA-Z0-9]+$/.test(formValues.messageCode)) {
      newErrors.messageCode = true;
      hasError = true;
    }

    if (!formValues.messageContent.trim()) {
      newErrors.messageContent = true;
      hasError = true;
    }

    if (!formValues.courseCode) {
      newErrors.courseCode = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const updatedMessages = messageToEdit
      ? messages.map((msg) =>
          msg.messageCode === messageToEdit.messageCode ? formValues : msg
        )
      : [...messages, formValues];

    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    setOpenSnackbar(true);
    setTimeout(() => navigate('/MSGManage'), 1000);
  };

  const handleCancelClick = () => {
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate('/MSGManage');
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {messageToEdit ? 'Edit Message' : 'Add New Message'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            id="messageCode"
            name="messageCode"
            label="Message Code"
            value={formValues.messageCode}
            onChange={handleChange}
            fullWidth
            disabled={!!messageToEdit}
            error={errors.messageCode}
            helperText={errors.messageCode ? 'Message code must be unique and alphanumeric' : ''}
          />

          <FormControl fullWidth error={errors.courseCode}>
            <InputLabel id="course-code-label">Course Code</InputLabel>
            <Select
              labelId="course-code-label"
              name="courseCode"
              value={formValues.courseCode}
              label="Course Code"
              onChange={(e) => {
                const selected = courseOptions.find((c) => c.courseCode === e.target.value);
                setFormValues({
                  ...formValues,
                  courseCode: selected?.courseCode || '',
                  courseName: selected?.courseName || '',
                });
                setErrors((prev) => ({ ...prev, courseCode: false }));
              }}
              disabled={!!messageToEdit}
            >
              {courseOptions.map((course) => (
                <MenuItem key={course.courseCode} value={course.courseCode}>
                  {course.courseCode} - {course.courseName}
                </MenuItem>
              ))}
            </Select>
            {errors.courseCode && (
              <Typography variant="caption" color="error" sx={{ pl: 2 }}>
                Course code is required
              </Typography>
            )}
          </FormControl>

          <TextField
            id="courseName"
            name="courseName"
            label="Course Name"
            value={formValues.courseName}
            fullWidth
            disabled
          />

          <TextField
            id="assignmentName"
            name="assignmentName"
            label="Assignment Name"
            value={formValues.assignmentName}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            id="messageContent"
            name="messageContent"
            label="Message Content"
            value={formValues.messageContent}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            error={errors.messageContent}
            helperText={errors.messageContent ? 'Message content is required' : ''}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={handleCancelClick} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={handleCloseSnackbar}>
          Message successfully saved!
        </Alert>
      </Snackbar>

      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">{"Confirm Cancellation"}</DialogTitle>
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