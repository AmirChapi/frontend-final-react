import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function MSGManage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    setMessages(storedMessages);
  }, []);

  const handleEdit = (msg) => {
    navigate('/MSGFForms', { state: { messageToEdit: msg } });
  };

  const handleDeleteClick = (id) => {
    setMessageToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    const updated = messages.filter((msg) => msg.id !== messageToDelete);
    setMessages(updated);
    localStorage.setItem('messages', JSON.stringify(updated));
    setOpenDeleteDialog(false);
  };

  const handleAddNewMessage = () => {
    navigate('/MSGFForms');
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Message Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={handleAddNewMessage}>
          Add New Message
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              {['Message Code', 'Course Code', 'Course Name', 'Assignment Name', 'Message Content', 'Actions'].map((header) => (
                <TableCell key={header} sx={{ color: 'white', fontWeight: 'bold', textAlign: header === 'Actions' ? 'center' : 'left' }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {messages.length ? (
              messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell>{msg.messageCode}</TableCell>
                  <TableCell>{msg.courseCode}</TableCell>
                  <TableCell>{msg.courseName}</TableCell>
                  <TableCell>{msg.assignmentName}</TableCell>
                  <TableCell>{msg.messageContent}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton color="info" onClick={() => handleEdit(msg)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(msg.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => navigate('/TaskManage')}
                      >
                        <AssignmentIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No messages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this message?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
