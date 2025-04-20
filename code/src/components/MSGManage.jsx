// src/components/MSGManage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

export default function MSGManage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    setMessages(storedMessages);
  }, []);

  const handleEdit = (messageId) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      localStorage.setItem('editMessage', JSON.stringify(message));
      navigate('/MSGFForms');
    }
  };

  const handleDeleteClick = (messageId) => {
    setMessageToDelete(messageId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setMessageToDelete(null);
  };

  const handleConfirmDelete = () => {
    const updatedMessages = messages.filter((msg) => msg.id !== messageToDelete);
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    handleCloseDeleteDialog();
  };

  const handleNavigateToAssignments = (courseCode, assignmentName) => {
    console.log('Navigating to assignments for:', courseCode, assignmentName);
    navigate('/TaskManage');
  };

  const handleAddNewMessage = () => {
    localStorage.removeItem('editMessage');
    navigate('/MSGFForms');
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Message Management
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table sx={{ minWidth: 650 }} aria-label="message table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Message Code</TableCell>
              <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Course Code</TableCell>
              <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Course Name</TableCell>
              <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Assignment Name</TableCell>
              <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Message Content</TableCell>
              <TableCell sx={{ color: 'common.white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell>{message.messageCode}</TableCell>
                <TableCell>{message.courseCode}</TableCell>
                <TableCell>{message.courseName}</TableCell>
                <TableCell>{message.assignmentName}</TableCell>
                <TableCell>{message.messageContent}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <IconButton color="info" onClick={() => handleEdit(message.id)} title="Edit Message">
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(message.id)} title="Delete Message">
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() =>
                        handleNavigateToAssignments(message.courseCode, message.assignmentName)
                      }
                      title="Go to Assignments"
                    >
                      <AssignmentIcon fontSize="inherit" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No messages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={handleAddNewMessage}>
          Add New Message
        </Button>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this message?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
