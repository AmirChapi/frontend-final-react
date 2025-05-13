// src/components/StudentsManage.jsx
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
import { listStudent } from '../firebase/student';

export default function StudentsManage() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    listStudent().then((student) => {
      setStudents(student);
      setIsLoading(false);
    });
  }, []);

  const handleAddStudent = () => {
    navigate("/StudentsForm");
  };

  const handleEdit = (student) => {
    navigate("/StudentsForm", { state: { studentToEdit: student } });
  };

  const handleDelete = (indexToDelete) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (confirmDelete) {
      const updatedStudents = students.filter((_, index) => index !== indexToDelete);
      setStudents(updatedStudents);
      localStorage.setItem("students", JSON.stringify(updatedStudents));
    }
  };
  if (isLoading) {
 return (
    <Box style={{ display: "flex" }}>
      <LinearProgress
        variant="indeterminate"
        style={{ width: "100%" }}
      />
    </Box>);
  } else {

    return (
      <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Students Management
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
           variant="contained"
            sx={{ backgroundColor: "#1976d2" }}
            onClick={handleAddStudent}
          >
            ADD NEW STUDENT
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Student ID</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Full Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Age</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Registration Year</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Gender</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => (
                  <TableRow key={index}>
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
                        <IconButton color="error" onClick={() => handleDelete(index)}>
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
}