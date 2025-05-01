import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from '@mui/material';

export default function MSGForms() {
  const navigate = useNavigate();

  const initialValues = {
    messageCode: '',
    courseCode: '',
    courseName: '',
    messageContent: '',
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [courseOptions, setCourseOptions] = useState([]);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem('coursesList')) || [];
    setCourseOptions(storedCourses);

    const storedMessage = localStorage.getItem('editMessage');
    if (storedMessage) {
      setFormValues(JSON.parse(storedMessage));
      setEditMode(true);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prev => ({ ...prev, [name]: value }));

    let errorField = false;

    if (name === 'messageCode') {
      const messages = JSON.parse(localStorage.getItem('messages')) || [];
      const exists = messages.some(
        (msg) => msg.messageCode === value && (!editMode || msg.id !== formValues.id)
      );
      errorField = !value || exists;
    }

    if (name === 'messageContent') {
      errorField = !value.trim();
    }

    setErrors(prev => ({ ...prev, [name]: errorField }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    const updatedMessages = JSON.parse(localStorage.getItem('messages')) || [];

    const isDuplicate = updatedMessages.some(
      (msg) => msg.messageCode === formValues.messageCode && (!editMode || msg.id !== formValues.id)
    );

    if (isDuplicate) {
      setErrors(prev => ({ ...prev, messageCode: true }));
      return;
    }

    let finalMessages;
    if (editMode) {
      finalMessages = updatedMessages.map((msg) =>
        msg.messageCode === formValues.messageCode ? { ...formValues, id: msg.id } : msg
      );
      localStorage.removeItem('editMessage');
    } else {
      const newMessage = { ...formValues, id: `msg${Date.now()}` };
      finalMessages = [...updatedMessages, newMessage];
    }

    localStorage.setItem('messages', JSON.stringify(finalMessages));
    setOpenSnackbar(true);
    setTimeout(() => navigate('/MSGManage'), 1000);
  };

  const handleCancelClick = () => {
    setOpenCancelDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCancelDialog(false);
  };

  const handleConfirmCancel = () => {
    handleCloseDialog();
    localStorage.removeItem('editMessage');
    navigate('/MSGManage');
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  return (
    <>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          maxWidth: '600px',
          margin: 'auto',
          mt: 4,
          '& .MuiTextField-root': { m: 1.5, width: '90%' },
          '& .MuiButton-root': { m: 1 },
        }}
        noValidate
        autoComplete="off"
        onSubmit={handleSave}
      >
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          {editMode ? 'Edit Message' : 'Add New Message'}
        </Typography>

        <TextField
          required
          name="messageCode"
          label="Message Code"
          value={formValues.messageCode}
          onChange={handleChange}
          disabled={editMode}
          error={errors.messageCode}
          helperText={errors.messageCode ? "Message code is required or already exists" : ""}
        />

        <FormControl required sx={{ m: 1.5, width: '90%' }}>
          <InputLabel id="course-code-label">Course Code</InputLabel>
          <Select
            labelId="course-code-label"
            name="courseCode"
            value={formValues.courseCode}
            onChange={(e) => {
              const selected = courseOptions.find(c => c.courseCode === e.target.value);
              setFormValues({
                ...formValues,
                courseCode: selected?.courseCode || '',
                courseName: selected?.courseName || ''
              });
            }}
            label="Course Code"
            disabled={editMode}
          >
            {courseOptions.map((course) => (
              <MenuItem key={course.courseCode} value={course.courseCode}>
                {course.courseCode} - {course.courseName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          required
          name="courseName"
          label="Course Name"
          value={formValues.courseName}
          disabled
        />

        <TextField
          required
          name="messageContent"
          label="Message Content"
          multiline
          rows={4}
          value={formValues.messageContent}
          onChange={handleChange}
          error={errors.messageContent}
          helperText={errors.messageContent ? "Message content is required" : ""}
        />

        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center', width: '90%' }}>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancelClick}>
            Cancel
          </Button>
        </Stack>
      </Box>

      <Dialog
        open={openCancelDialog}
        onClose={handleCloseDialog}
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
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmCancel} color="secondary" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={handleCloseSnackbar}>
          Message successfully saved!
        </Alert>
      </Snackbar>
    </>
  );
}
