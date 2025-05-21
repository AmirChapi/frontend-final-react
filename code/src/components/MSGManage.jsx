// // ✅ MSGManage.jsx - דף הצגת ההודעות (ללא שימוש ב-id)
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   IconButton,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Stack,
// } from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AssignmentIcon from '@mui/icons-material/Assignment';

// export default function MSGManage() {
//   const navigate = useNavigate();
//   const [messages, setMessages] = useState([]);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [messageToDelete, setMessageToDelete] = useState(null);

//   useEffect(() => {
//     const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
//     setMessages(storedMessages);
//   }, []);

//   const handleAddNewMessage = () => {
//     navigate('/MSGForm');
//   };

//   const handleEdit = (message) => {
//     navigate('/MSGForm', { state: { messageToEdit: message } });
//   };

//   const handleDeleteClick = (message) => {
//     setMessageToDelete(message);
//     setOpenDeleteDialog(true);
//   };

//   const handleConfirmDelete = () => {
//     if (!messageToDelete) return;
//     const updated = messages.filter((msg) => msg.messageCode !== messageToDelete.messageCode);
//     setMessages(updated);
//     localStorage.setItem('messages', JSON.stringify(updated));
//     setOpenDeleteDialog(false);
//     setMessageToDelete(null);
//   };

//   return (
//     <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
//       <Typography variant="h4" gutterBottom>
//         Message Management
//       </Typography>

//       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
//         <Button variant="contained" onClick={handleAddNewMessage}>
//           Add New Message
//         </Button>
//       </Box>

//       <TableContainer component={Paper} sx={{ mb: 3 }}>
//         <Table>
//           <TableHead sx={{ backgroundColor: 'primary.main' }}>
//             <TableRow>
//               {['Message Code', 'Course Code', 'Course Name', 'Assignment Name', 'Message Content', 'Actions'].map((header) => (
//                 <TableCell
//                   key={header}
//                   sx={{ color: 'white', fontWeight: 'bold', textAlign: header === 'Actions' ? 'center' : 'left' }}
//                 >
//                   {header}
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {messages.length ? (
//               messages.map((msg) => (
//                 <TableRow key={msg.messageCode}>
//                   <TableCell>{msg.messageCode}</TableCell>
//                   <TableCell>{msg.courseCode}</TableCell>
//                   <TableCell>{msg.courseName}</TableCell>
//                   <TableCell>{msg.assignmentName}</TableCell>
//                   <TableCell>{msg.messageContent}</TableCell>
//                   <TableCell align="center">
//                     <Stack direction="row" spacing={0.5} justifyContent="center">
//                       <IconButton color="info" onClick={() => handleEdit(msg)}>
//                         <EditIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton color="error" onClick={() => handleDeleteClick(msg)}>
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton color="secondary" onClick={() => navigate('/TaskManage')}>
//                         <AssignmentIcon fontSize="small" />
//                       </IconButton>
//                     </Stack>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={6} align="center">
//                   No messages found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
//         <DialogTitle>Confirm Deletion</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete this message?
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
//           <Button onClick={handleConfirmDelete} color="error" autoFocus>
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

// MSGManage.jsx - דף ניהול הודעות עם כפתור הפצת ציונים
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

export default function MSGManage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  useEffect(() => {
    setMessages(JSON.parse(localStorage.getItem('messages')) || []);
    setStudents(JSON.parse(localStorage.getItem('students')) || []);
    setGrades(JSON.parse(localStorage.getItem('grades')) || []);
    setTasks(JSON.parse(localStorage.getItem('tasks')) || []);
  }, []);

  const handleAddNewMessage = () => {
    navigate('/MSGForm');
  };

  const handleEdit = (message) => {
    navigate('/MSGForm', { state: { messageToEdit: message } });
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!messageToDelete) return;
    const updated = messages.filter((msg) => msg.messageCode !== messageToDelete.messageCode);
    setMessages(updated);
    localStorage.setItem('messages', JSON.stringify(updated));
    setOpenDeleteDialog(false);
    setMessageToDelete(null);
  };

  const handleDistributeGrades = () => {
    const newMessages = [];

    grades.forEach((grade) => {
      const task = tasks.find(t => t.taskCode === grade.taskCode);
      if (!task) return;

      const messageCode = `grade_${grade.taskCode}_${grade.idNumber}`;
      const exists = messages.some(m => m.messageCode === messageCode);
      if (exists) return;

      newMessages.push({
        messageCode,
        courseCode: task.courseCode,
        assignmentCode: task.taskCode,
        studentId: grade.idNumber,
        messageContent: `You received a grade of ${grade.taskGrade} on the task "${task.taskName}".`
      });
    });

    const updatedMessages = [...messages, ...newMessages];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    alert(`${newMessages.length} grade messages distributed.`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Message Management</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" onClick={handleAddNewMessage}>Add New Message</Button>
        <Button variant="outlined" color="secondary" onClick={handleDistributeGrades}>Distribute Grades</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Message Code</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Course Code</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Assignment</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Content</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.length > 0 ? messages.map((msg) => (
              <TableRow key={msg.messageCode}>
                <TableCell>{msg.messageCode}</TableCell>
                <TableCell>{msg.courseCode || '-'}</TableCell>
                <TableCell>{msg.assignmentCode || '-'}</TableCell>
                <TableCell>{msg.studentId || 'All'}</TableCell>
                <TableCell>{msg.messageContent}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <IconButton color="info" onClick={() => handleEdit(msg)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(msg)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No messages found.</TableCell>
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
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}