import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Select,
  MenuItem,
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

    if (!studentId) {
      // בחירה של "All Students"
      localStorage.removeItem("selectedStudent");
      window.location.reload();
      return;
    }

    const student = students.find((s) => s.studentId === studentId);
    if (student) {
      const data = {
        studentId: student.studentId,
        fullName: student.fullName,
        courses: student.courses || [],
      };
      localStorage.setItem("selectedStudent", JSON.stringify(data));
      window.location.reload();
    }
  };


  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#ebdfd1', position: 'relative' }}>
      <Toolbar sx={{ position: 'relative' }}>
        {/* תפריט צדדי */}
        <SideDropdownMenu />

        {/* לוגו בצד שמאל */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={handleHomeClick}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="MHA Logo"
            sx={{ height: 110, width: 110, mr: 1 }}
          />
        </Box>

        {/* כותרת ממורכזת */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
            fontSize: '1.2rem', // ← להוסיף גודל אחיד
            color: '#333',
            fontFamily: 'Arial' // ← להבטיח אחידות
          }}
        >
          MHA College
        </Typography>


        {/* רווח מתרחב */}
        <Box sx={{ flexGrow: 1 }} />

        {/* בחירת סטודנט בצד ימין */}
        <Box
          sx={{
            mb: 0.5,
            fontWeight: 'bold',
            fontSize: '1.2rem', // ← תואם ל־MHA College
            color: '#333',
            fontFamily: 'Arial', // ← אותו פונט
          }}
        >
          Select Student:
        </Box>

        <Select
          value={selectedStudentId}
          onChange={handleChange}
          size="small"
          sx={{
            minWidth: 250,
            backgroundColor: 'white',
            borderRadius: 1,
            ml: 1,
          }}
        >
          {/* אפשרות להצגת כל הסטודנטים */}
          <MenuItem value="">
            All Students
          </MenuItem>

          {students.map((s) => (
            <MenuItem key={s.studentId} value={s.studentId}>
              {s.fullName} ({s.studentId})
            </MenuItem>
          ))}
        </Select>

      </Toolbar>
    </AppBar>
  );
}
