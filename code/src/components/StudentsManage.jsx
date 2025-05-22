// StudentsManage.jsx - Students Management Page (Final Styling)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  LinearProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { listStudent, deleteStudent } from '../firebase/student';

export default function StudentsManage() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const studentList = await listStudent();

    //  בודקת שהתוצאה שחזרה היא באמת מערך ואם כן, היא שומרת את הרשימה .
    //(זה מגן מפני מצב שבו תחזור שגיאה או משהו אחר לא צפוי.)
    if (Array.isArray(studentList)) {
      setStudents(studentList);
    }
    setIsLoading(false);
  };

  const handleAddStudent = () => {
    navigate("/StudentsForm");
  };

  const handleEdit = (student) => {
    navigate("/StudentsForm", { state: { studentToEdit: student } });
  };

  const handleDelete = async (student) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    const result = await deleteStudent(student.id);

//🔹 יוצרים רשימה חדשה של סטודנטים – שמכילה את כל הסטודנטים חוץ מזה שנמחק.
    const updatedList = students.filter((s) => s.id !== student.id); 
    setStudents(updatedList);
  };

  if (isLoading) {
    return (
      <Box style={{ display: "flex" }}>
        <LinearProgress variant="indeterminate" style={{ width: "100%" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Management
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Button variant="contained" color="primary" onClick={handleAddStudent}>
          Add New Student
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Existing Students
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Registration Year</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.fullName}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton color="info" onClick={() => handleEdit(student)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(student)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
