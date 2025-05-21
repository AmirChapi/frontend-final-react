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
// CoursesManage.jsx - ניהול קורסים כולל הוספה, מחיקה, עריכה, שיוך סטודנטים
// CoursesManage.jsx - ניהול קורסים כולל הוספה, מחיקה, עריכה, שיוך סטודנטים
// CoursesManage.jsx
import React, { useEffect, useState } from "react";
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
  TextField,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { listStudent } from "../firebase/student";

export default function CoursesManage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    courseCode: "",
    courseName: "",
    lecturer: "",
    year: "",
    semester: "",
    assignedStudents: [],
  });
  const [selectedStudentsPerCourse, setSelectedStudentsPerCourse] = useState({});

  useEffect(() => {
    async function fetchData() {
      const studentsFromFS = await listStudent();
      const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
      const mergedStudents = mergeStudents(studentsFromFS, storedStudents);

      setStudents(mergedStudents);
      localStorage.setItem("students", JSON.stringify(mergedStudents));

      const localCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
      setCourses(localCourses);
    }
    fetchData();
  }, []);

  const mergeStudents = (firestoreList, localList) => {
    return firestoreList.map(f => {
      const match = localList.find(l => l.studentId === f.studentId);
      return match ? { ...f, ...match } : f;
    });
  };

  const handleAddCourse = () => {
    if (!newCourse.courseCode || !newCourse.courseName) {
      alert("יש למלא את כל שדות החובה");
      return;
    }

    const exists = courses.some(c => c.courseCode === newCourse.courseCode);
    if (exists) {
      alert("קורס עם קוד זה כבר קיים");
      return;
    }

    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    localStorage.setItem("coursesList", JSON.stringify(updatedCourses));

    setNewCourse({ courseCode: "", courseName: "", lecturer: "", year: "", semester: "", assignedStudents: [] });
    alert("קורס נוסף בהצלחה!");
  };

  const handleStudentAssign = (courseCode, studentId) => {
    const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = storedStudents.map((student) => {
      if (student.studentId === studentId) {
        const updatedCourses = student.courses || [];
        if (!updatedCourses.includes(courseCode)) {
          return { ...student, courses: [...updatedCourses, courseCode] };
        }
      }
      return student;
    });
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setStudents(updatedStudents);

    const updatedCourses = courses.map((course) => {
      if (course.courseCode === courseCode) {
        const assigned = course.assignedStudents || [];
        if (!assigned.includes(studentId)) {
          return { ...course, assignedStudents: [...assigned, studentId] };
        }
      }
      return course;
    });
    setCourses(updatedCourses);
    localStorage.setItem("coursesList", JSON.stringify(updatedCourses));

    alert("הסטודנט שויך לקורס בהצלחה!");
  };

  const handleDeleteCourse = (courseCode) => {
    const updatedCourses = courses.filter(c => c.courseCode !== courseCode);
    setCourses(updatedCourses);
    localStorage.setItem("coursesList", JSON.stringify(updatedCourses));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>ניהול קורסים</Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">הוספת קורס חדש</Typography>
        <TextField label="Course Code" fullWidth margin="normal" value={newCourse.courseCode} onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })} />
        <TextField label="Course Name" fullWidth margin="normal" value={newCourse.courseName} onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })} />
        <TextField label="Lecturer" fullWidth margin="normal" value={newCourse.lecturer} onChange={(e) => setNewCourse({ ...newCourse, lecturer: e.target.value })} />
        <TextField label="Year" fullWidth margin="normal" value={newCourse.year} onChange={(e) => setNewCourse({ ...newCourse, year: e.target.value })} />
        <TextField label="Semester" fullWidth margin="normal" value={newCourse.semester} onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })} />
        <Button variant="contained" color="primary" onClick={handleAddCourse}>הוסף קורס</Button>
      </Paper>

      <Typography variant="h6" gutterBottom>רשימת קורסים קיימים</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>שיוך סטודנט</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.courseCode}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <Select
                      value={selectedStudentsPerCourse[course.courseCode] || ""}
                      onChange={(e) => setSelectedStudentsPerCourse({ ...selectedStudentsPerCourse, [course.courseCode]: e.target.value })}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>בחר סטודנט</MenuItem>
                      {students.map((student) => (
                        <MenuItem key={student.studentId} value={student.studentId}>{student.fullName}</MenuItem>
                      ))}
                    </Select>
                    <Button sx={{ mt: 1 }} variant="outlined" onClick={() => handleStudentAssign(course.courseCode, selectedStudentsPerCourse[course.courseCode])}>שיוך</Button>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Button color="error" onClick={() => handleDeleteCourse(course.courseCode)}>🗑️ מחק</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}