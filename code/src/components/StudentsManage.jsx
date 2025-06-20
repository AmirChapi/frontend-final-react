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
    if (Array.isArray(studentList)) {
      setStudents(studentList);
    }
    setIsLoading(false);
  };

  const handleAddStudent = () => {
    navigate("/StudentsForm");
  };

  const handleEdit = (student) => {
    navigate(`/StudentsForm/${student.id}`);
  };

  const handleDelete = async (student) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    await deleteStudent(student.id);
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
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3d3d3d' }}
      >
        Student Management
      </Typography>

      <Typography
        variant="subtitle1"
        textAlign="center"
        sx={{
          mb: 3,
          color: '#555',
          fontWeight: 500,
          fontSize: '1.1rem',
        }}
      >
       All students, for administrators only.
            </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleAddStudent}
          sx={{
            backgroundColor: '#ebdfd1',
            color: '#000',
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
            '&:hover': {
              backgroundColor: '#c0aa92',
            },
          }}
        >
          Add New Student
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          border: '2px solid #c0aa92',
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#ebdfd1' }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#ebdfd1' }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#ebdfd1' }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#ebdfd1' }}>Registration Year</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#ebdfd1' }}>Gender</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ebdfd1' }}>
                Actions
              </TableCell>
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
