// CoursesManage.jsx - דף ניהול קורסים עם נתונים מ-Firestore
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
  Select,
  LinearProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { listStudent, updateStudent } from "../firebase/student";
import { listCourses, deleteCourse, updateCourse } from "../firebase/course";

export default function CoursesManage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const courseList = await listCourses();
      const studentList = await listStudent();
      setCourses(courseList);
      setStudents(studentList);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleEditCourse = (course) => {
    navigate("/CourseForm", { state: { courseToEdit: course } });
  };

  const handleDeleteCourse = async (courseCode) => {
    await deleteCourse(courseCode);
    setCourses(prev => prev.filter(c => c.courseCode !== courseCode));
  };

  const handleViewStudents = (course) => {
    const matchedStudents = students.filter(s => (s.courses || []).includes(course.courseCode));
    setSelectedCourse(course);
    setSelectedCourseStudents(matchedStudents);
    setOpenDialog(true);
  };

  const handleRemoveStudent = async (studentId) => {
    const updatedStudentList = students.map(s => {
      if (s.studentId === studentId) {
        const newCourses = (s.courses || []).filter(code => code !== selectedCourse.courseCode);
        updateStudent({ ...s, courses: newCourses });
        return { ...s, courses: newCourses };
      }
      return s;
    });

    setStudents(updatedStudentList);
    setSelectedCourseStudents(prev => prev.filter(s => s.studentId !== studentId));
  };

  const handleAssignStudent = async () => {
    if (!selectedCourse || !selectedStudentId) return;

    const student = students.find(s => s.studentId === selectedStudentId);
    if (!student) return;

    const updatedCourses = [...(student.courses || []), selectedCourse.courseCode];
    await updateStudent({ ...student, courses: updatedCourses });

    setStudents(prev => prev.map(s =>
      s.studentId === student.studentId ? { ...s, courses: updatedCourses } : s
    ));

    handleViewStudents(selectedCourse);
    setSelectedStudentId("");
  };

  if (isLoading) return <LinearProgress />;

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
