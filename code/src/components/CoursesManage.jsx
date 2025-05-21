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
// CoursesManage.jsx - רק טבלה + כפתור להוספת קורס

// CoursesManage.jsx - כולל שיוך והסרה של סטודנטים
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  MenuItem,
  Select
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { listStudent } from "../firebase/student";

export default function CoursesManage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const localCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
    setCourses(localCourses);

    async function fetchStudents() {
      const fromFS = await listStudent();
      const local = JSON.parse(localStorage.getItem("students")) || [];
      const merged = fromFS.map(f => {
        const match = local.find(l => l.studentId === f.studentId);
        return match ? { ...f, ...match } : f;
      });
      setStudents(merged);
    }
    fetchStudents();
  }, []);

  const updateLocalStorage = (updatedCourses, updatedStudents) => {
    localStorage.setItem("coursesList", JSON.stringify(updatedCourses));
    localStorage.setItem("students", JSON.stringify(updatedStudents));
  };

  const handleEditCourse = (course) => {
    navigate("/CourseForm", { state: { courseToEdit: course } });
  };

  const handleDeleteCourse = (courseCode) => {
    const updatedCourses = courses.filter(c => c.courseCode !== courseCode);
    setCourses(updatedCourses);
    localStorage.setItem("coursesList", JSON.stringify(updatedCourses));
  };

  const handleViewStudents = (course) => {
    const matchedStudents = students.filter(s => (s.courses || []).includes(course.courseCode));
    setSelectedCourse(course);
    setSelectedCourseStudents(matchedStudents);
    setOpenDialog(true);
  };

  const handleRemoveStudent = (studentId) => {
    const updatedCourses = courses.map(c => {
      if (c.courseCode === selectedCourse.courseCode) {
        return {
          ...c,
          assignedStudents: (c.assignedStudents || []).filter(id => id !== studentId)
        };
      }
      return c;
    });

    const updatedStudents = students.map(s => {
      if (s.studentId === studentId) {
        return {
          ...s,
          courses: (s.courses || []).filter(code => code !== selectedCourse.courseCode)
        };
      }
      return s;
    });

    setCourses(updatedCourses);
    setStudents(updatedStudents);
    updateLocalStorage(updatedCourses, updatedStudents);
    setSelectedCourseStudents(prev => prev.filter(s => s.studentId !== studentId));
  };

  const handleAssignStudent = () => {
    if (!selectedCourse || !selectedStudentId) return;

    const updatedCourses = courses.map(c => {
      if (c.courseCode === selectedCourse.courseCode) {
        const assigned = c.assignedStudents || [];
        if (!assigned.includes(selectedStudentId)) {
          return { ...c, assignedStudents: [...assigned, selectedStudentId] };
        }
      }
      return c;
    });

    const updatedStudents = students.map(s => {
      if (s.studentId === selectedStudentId) {
        const updated = s.courses || [];
        if (!updated.includes(selectedCourse.courseCode)) {
          return { ...s, courses: [...updated, selectedCourse.courseCode] };
        }
      }
      return s;
    });

    setCourses(updatedCourses);
    setStudents(updatedStudents);
    updateLocalStorage(updatedCourses, updatedStudents);
    setSelectedStudentId("");
    handleViewStudents(selectedCourse);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>ניהול קורסים</Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 3 }}
        onClick={() => navigate("/CourseForm")}
      >
        הוסף קורס חדש
      </Button>

      <Typography variant="h6" gutterBottom>רשימת קורסים קיימים</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>קוד קורס</TableCell>
              <TableCell>שם קורס</TableCell>
              <TableCell>מרצה</TableCell>
              <TableCell>שנה</TableCell>
              <TableCell>סמסטר</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.courseCode}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>{course.lecturer}</TableCell>
                <TableCell>{course.year}</TableCell>
                <TableCell>{course.semester}</TableCell>
                <TableCell>
                  <Button size="small" color="info" onClick={() => handleViewStudents(course)}>
                    סטודנטים משויכים
                  </Button>
                  <Button size="small" color="secondary" onClick={() => handleEditCourse(course)}>
                    ערוך
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDeleteCourse(course.courseCode)}>
                    מחק
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>סטודנטים משויכים לקורס</DialogTitle>
        <DialogContent>
          {selectedCourseStudents.length > 0 ? (
            <List>
              {selectedCourseStudents.map((student) => (
                <ListItem key={student.studentId} secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => handleRemoveStudent(student.studentId)}>
                    <DeleteIcon />
                  </IconButton>
                }>
                  <ListItemText primary={`${student.fullName} (${student.studentId})`} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ my: 2 }}>אין סטודנטים משויכים לקורס זה.</Typography>
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <Select
              displayEmpty
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <MenuItem value="" disabled>בחר סטודנט לשיוך</MenuItem>
              {students
                .filter(s => !(s.courses || []).includes(selectedCourse?.courseCode))
                .map(s => (
                  <MenuItem key={s.studentId} value={s.studentId}>{s.fullName}</MenuItem>
                ))}
            </Select>
            <Button sx={{ mt: 1 }} onClick={handleAssignStudent} variant="outlined">שיוך סטודנט</Button>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
