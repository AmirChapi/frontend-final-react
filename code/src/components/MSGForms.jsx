// src/components/MSGForms.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function MSGForms() {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    messageCode: '',
    courseCode: '',
    courseName: '',
    assignmentCode: '',
    assignmentName: '',
    messageContent: '',
  });

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Load data if editing
  useEffect(() => {
    const storedMessage = localStorage.getItem('editMessage');
    if (storedMessage) {
      setFormValues(JSON.parse(storedMessage));
      setEditMode(true);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSave = (event) => {
    event.preventDefault();
    let updatedMessages = JSON.parse(localStorage.getItem('messages')) || [];

    if (editMode) {
      updatedMessages = updatedMessages.map((msg) =>
        msg.messageCode === formValues.messageCode ? { ...formValues, id: msg.id } : msg
      );
      localStorage.removeItem('editMessage');
    } else {
      const newMessage = { ...formValues, id: `msg${Date.now()}` };
      updatedMessages.push(newMessage);
    }

    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    navigate('/MSGManage');
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

  const handleHelp = () => {
    navigate('/help');
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
          id="message-code"
          name="messageCode"
          label="Message Code"
          value={formValues.messageCode}
          onChange={handleChange}
          variant="outlined"
          disabled={editMode}
        />
        <TextField
          required
          id="course-code"
          name="courseCode"
          label="Course Code"
          value={formValues.courseCode}
          onChange={handleChange}
          variant="outlined"
          disabled={editMode}
        />
        <TextField
          required
          id="course-name"
          name="courseName"
          label="Course Name"
          value={formValues.courseName}
          onChange={handleChange}
          variant="outlined"
        />
        <TextField
          required
          id="assignment-code"
          name="assignmentCode"
          label="Assignment Code"
          value={formValues.assignmentCode}
          onChange={handleChange}
          variant="outlined"
          disabled={editMode}
        />
        <TextField
          required
          id="assignment-name"
          name="assignmentName"
          label="Assignment Name"
          value={formValues.assignmentName}
          onChange={handleChange}
          variant="outlined"
        />
        <TextField
          required
          id="message-content"
          name="messageContent"
          label="Message Content"
          multiline
          rows={4}
          value={formValues.messageContent}
          onChange={handleChange}
          variant="outlined"
        />

        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center', width: '90%' }}>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancelClick}>
            Cancel
          </Button>
          <Button variant="text" onClick={handleHelp}>
            Help
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
    </>
  );
}
