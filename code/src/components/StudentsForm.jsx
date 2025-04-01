import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

export default function StudentRegistrationForm() {
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [year, setYear] = useState('');

  const handleIdChange = (event) => {
    setStudentId(event.target.value);
  };

  const handleFullNameChange = (event) => {
    setFullName(event.target.value);
  };

  const handleAgeChange = (event) => {
    setAge(event.target.value);
  };

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Basic validation
    if (
      !studentId.trim() ||
      !fullName.trim() ||
      !age.trim() ||
      !gender ||
      !setYear
    ) {
      alert('Please fill in all fields.');
      return;
    }

    const newStudent = {
      id: studentId,
      fullName: fullName,
      age: age,
      gender: gender,
      setYear: setYear,
    };

    // Log the new student object to the console
    console.log('New Student:', newStudent);

    // Clear the form fields
    setStudentId('');
    setFullName('');
    setAge('');
    setGender('');
    setYear('');
  };

  // Generate the last 3 years for the select list
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '30ch' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
      }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" component="div" gutterBottom>
        Student Registration
      </Typography>

      <TextField
        required
        id="student-id"
        label="Student ID"
        type="number"
        value={studentId}
        onChange={handleIdChange}
      />

      <TextField
        required
        id="full-name"
        label="Full Name"
        value={fullName}
        onChange={handleFullNameChange}
      />

      <TextField
        required
        id="age"
        label="Age"
        type="number"
        value={age}
        onChange={handleAgeChange}
      />

      <FormControl component="fieldset" sx={{ m: 1 }}>
        <FormLabel component="legend">Gender</FormLabel>
        <RadioGroup
          row
          aria-label="gender"
          name="gender"
          value={gender}
          onChange={handleGenderChange}
        >
          <FormControlLabel value="female" control={<Radio />} label="Female" />
          <FormControlLabel value="male" control={<Radio />} label="Male" />
          <FormControlLabel value="other" control={<Radio />} label="Other" />
        </RadioGroup>
      </FormControl>

      <FormControl sx={{ m: 1, width: '30ch' }}>
      <TextField
        required
        id="year"
        label="year"
        type="number"
        value={year}
        onChange={handleYearChange}
      />

      </FormControl>

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Register
      </Button>
    </Box>
  );
}
