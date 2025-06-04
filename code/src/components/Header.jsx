import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import SideDropdownMenu from './SideDropdownMenu';
import { useNavigate } from 'react-router-dom';
import { listStudent } from '../firebase/student';

export default function Header() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listStudent().then(setStudents);
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('selectedStudent'));
    if (stored?.studentId) {
      setSelectedStudentId(stored.studentId);
    }
  }, []);

  const handleChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);

    const student = students.find((s) => s.studentId === studentId);
    if (student) {
      const data = {
        studentId: student.studentId,
        fullName: student.fullName,
        courses: student.courses || [],
      };
      localStorage.setItem('selectedStudent', JSON.stringify(data));

      // רענון עמוד מלא כדי שכל הקומפוננטות ייטענו מחדש עם הסטודנט הנכון
      window.location.reload();
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#003366' }}>
      <Toolbar>
        <SideDropdownMenu />

        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={handleHomeClick}
        >
          <Box
            component="img"
            src="/mha-logo.png"
            alt="MHA Logo"
            sx={{ height: 110, width: 110, mr: 1 }}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            MHA College
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <FormControl sx={{ minWidth: 200, backgroundColor: 'white', borderRadius: 1 }}>
          <InputLabel>Select Student</InputLabel>
          <Select
            value={selectedStudentId}
            onChange={handleChange}
            label="Select Student"
            size="small"
          >
            {students.map((s) => (
              <MenuItem key={s.studentId} value={s.studentId}>
                {s.fullName} ({s.studentId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
}
