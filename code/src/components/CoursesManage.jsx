// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   IconButton,
//   Stack,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";

// export default function CourseManage() {
//   const [courses, setCourses] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
//     setCourses(storedCourses);
//   }, []);

//   const handleAddCourse = () => {
//     navigate("/CourseForm");
//   };

//   const handleEdit = (course) => {
//     navigate("/CourseForm", { state: { courseToEdit: course } });
//   };

//   const handleDelete = (indexToDelete) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this course?");
//     if (confirmDelete) {
//       const updatedCourses = courses.filter((_, index) => index !== indexToDelete);
//       setCourses(updatedCourses);
//       localStorage.setItem("coursesList", JSON.stringify(updatedCourses));
//     }
//   };

//   return (
//     <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
//       <Typography variant="h5" gutterBottom>
//         Course Management
//       </Typography>

//       <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
//           <Button
//           variant="contained"
//           sx={{ backgroundColor: "#1976d2" }}
//           onClick={handleAddCourse}
//         >
//           ADD NEW COURSE
//         </Button>
//       </Box>

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead sx={{ backgroundColor: "#1976d2" }}>
//             <TableRow>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Course Code</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Course Name</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lecturer</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>year</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>semester</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
//                 Actions
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {courses.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={6} align="center">
//                   No courses found.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               courses.map((course, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{course.courseCode}</TableCell>
//                   <TableCell>{course.courseName}</TableCell>
//                   <TableCell>{course.lecturer}</TableCell>
//                   <TableCell>{course.year}</TableCell>
//                   <TableCell>{course.semester}</TableCell>
//                   <TableCell align="center">
//                     <Stack direction="row" spacing={0.5} justifyContent="center">
//                       <IconButton color="info" onClick={() => handleEdit(course)}>
//                         <EditIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton color="error" onClick={() => handleDelete(index)}>
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Stack>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// }

import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { listStudent } from "../firebase/student";

export default function CoursesManage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentsPerCourse, setSelectedStudentsPerCourse] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsFromFirestore = await listStudent();
        setStudents(studentsFromFirestore);
        localStorage.setItem("students", JSON.stringify(studentsFromFirestore));
      } catch (error) {
        console.error("שגיאה בטעינת סטודנטים:", error);
      }

      const storedCourses = JSON.parse(localStorage.getItem('coursesList')) || [];
      setCourses(storedCourses);
      setLoading(false);
    };



    fetchData();
  }, []);

  const handleStudentChange = (courseId, studentId) => {
    setSelectedStudentsPerCourse(prev => ({
      ...prev,
      [courseId]: studentId
    }));
  };

  const handleAssignCourse = (courseId) => {
    const selectedStudentId = selectedStudentsPerCourse[courseId];

    if (!selectedStudentId) {
      alert("אנא בחר סטודנט תחילה");
      return;
    }

    const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
    const studentIndex = storedStudents.findIndex(s => s.studentId === selectedStudentId);

    if (studentIndex === -1) {
      alert("סטודנט לא נמצא");
      return;
    }

    const student = storedStudents[studentIndex];

    if (!student.courses) {
      student.courses = [];
    }

    if (!student.courses.includes(courseId)) {
      student.courses.push(courseId);
      storedStudents[studentIndex] = student;
      localStorage.setItem("students", JSON.stringify(storedStudents));
      alert("סטודנט שויך בהצלחה לקורס");
    } else {
      alert("הסטודנט כבר משויך לקורס זה");
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
  <Box sx={{ padding: 4 }}>
    <Typography variant="h4" gutterBottom>
      ניהול שיוך סטודנטים לקורסים
    </Typography>

    {courses.length === 0 ? (
      <Typography>לא קיימים קורסים להצגה</Typography>
    ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>קוד קורס</TableCell>
              <TableCell>שם קורס</TableCell>
              <TableCell>בחר סטודנט</TableCell>
              <TableCell>פעולה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.courseId}>
                <TableCell>{course.courseId}</TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel id={`select-student-label-${course.courseId}`}>בחר סטודנט</InputLabel>
                    <Select
                      labelId={`select-student-label-${course.courseId}`}
                      value={selectedStudentsPerCourse[course.courseId] || ''}
                      label="בחר סטודנט"
                      onChange={(e) => handleStudentChange(course.courseId, e.target.value)}
                    >
                      {students.map((student) => (
                        <MenuItem key={student.studentId} value={student.studentId}>
                          {student.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAssignCourse(course.courseId)}
                  >
                    שיוך לקורס
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Box>
);
}
