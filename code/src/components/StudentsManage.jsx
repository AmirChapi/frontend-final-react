import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

function StudentsTable() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
      try {
        setStudents(JSON.parse(storedStudents));
      } catch (error) {
        console.error('Error parsing students from localStorage:', error);
      }
    }
  }, []);

  const handleAddStudent = () => {
    navigate('/StudentsForm');
  };

  if (students.length === 0) {
    return (
      <Container>
        <Typography variant="h4" component="h2" gutterBottom>
          Students Data
        </Typography>
        <Button variant="contained" onClick={handleAddStudent}>
          Add Student
        </Button>
        <div>No students data found.</div>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Students Data
      </Typography>
      <Button variant="contained" onClick={handleAddStudent} sx={{ mb: 2 }}>
        Add Student
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="students table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Year</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {student.id}
                </TableCell>
                <TableCell>{student.fullName}</TableCell>
                <TableCell>{student.age}</TableCell>
                <TableCell>{student.gender}</TableCell>
                <TableCell>{student.year}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default StudentsTable;
