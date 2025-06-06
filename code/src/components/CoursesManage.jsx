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
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from '@mui/icons-material/AddCircle';

import { useNavigate } from "react-router-dom";
import { listStudent, updateStudent } from "../firebase/student";
import { listCourses, deleteCourse } from "../firebase/course";

export default function CoursesManage() {
  const [courseList, setCourseList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseToView, setCourseToView] = useState(null);
  const [studentsInCourse, setStudentsInCourse] = useState([]);
  const [studentIdToAssign, setStudentIdToAssign] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const allCourses = await listCourses();
      const allStudents = await listStudent();
      setCourseList(allCourses);
      setStudentList(allStudents);
      setLoading(false);
    }
    loadData();
  }, []);

  function goToEditCourse(courseObject) {
    navigate(`/CourseForm/${courseObject.id}`);
  }

  const deleteSelectedCourse = async (courseId) => {
    const confirm = window.confirm("Are you sure you want to delete this course?");
    if (confirm) {
      await deleteCourse(courseId);
      const updatedCourseList = courseList.filter(course => course.id !== courseId);
      setCourseList(updatedCourseList);
    }
  };

  function showCourseStudents(courseObject) {
    const matchedStudents = studentList.filter(function (student) {
      const courseCodes = student.courses || [];
      return courseCodes.includes(courseObject.courseCode);
    });
    setCourseToView(courseObject);
    setStudentsInCourse(matchedStudents);
    setIsDialogOpen(true);
  }

  async function removeStudentFromCourse(studentIdToRemove) {
    const updatedStudents = await Promise.all(
      studentList.map(async function (student) {
        if (student.studentId === studentIdToRemove) {
          const updatedCourses = (student.courses || []).filter(function (courseCode) {
            return courseCode !== courseToView.courseCode;
          });
          const updatedStudentObject = {
            ...student,
            courses: updatedCourses
          };
          await updateStudent(updatedStudentObject);
          return updatedStudentObject;
        } else {
          return student;
        }
      })
    );

    setStudentList(updatedStudents);

    const updatedCourseStudents = studentsInCourse.filter(function (student) {
      return student.studentId !== studentIdToRemove;
    });
    setStudentsInCourse(updatedCourseStudents);
  }

  async function assignStudentToCourse() {
    if (!courseToView || studentIdToAssign === "") return;

    const selectedStudent = studentList.find(function (student) {
      return student.studentId === studentIdToAssign;
    });

    if (!selectedStudent) return;

    const updatedCourses = [...(selectedStudent.courses || []), courseToView.courseCode];
    const updatedStudent = { ...selectedStudent, courses: updatedCourses };
    await updateStudent(updatedStudent);

    const updatedList = studentList.map(function (student) {
      return student.studentId === updatedStudent.studentId ? updatedStudent : student;
    });
    setStudentList(updatedList);
    showCourseStudents(courseToView);
    setStudentIdToAssign("");
  }

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ padding: 4 }}>
      {/* כותרת ממורכזת */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3d3d3d' }}
      >
        Course Management
      </Typography>

      {/* משפט הסבר ממורכז */}
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
        All courses, for administrators only.
      </Typography>

      {/* כפתור הוספה בעיצוב מותאם */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={() => navigate("/CourseForm")}
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
          Add New Course
        </Button>
      </Box>

      {/* טבלה */}
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
              <TableCell sx={{ backgroundColor: '#ebdfd1', fontWeight: 'bold' }}>Course Code</TableCell>
              <TableCell sx={{ backgroundColor: '#ebdfd1', fontWeight: 'bold' }}>Course Name</TableCell>
              <TableCell sx={{ backgroundColor: '#ebdfd1', fontWeight: 'bold' }}>Lecturer</TableCell>
              <TableCell sx={{ backgroundColor: '#ebdfd1', fontWeight: 'bold' }}>Year</TableCell>
              <TableCell sx={{ backgroundColor: '#ebdfd1', fontWeight: 'bold' }}>Semester</TableCell>
              <TableCell sx={{ backgroundColor: '#ebdfd1', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courseList.map((courseItem) => (
              <TableRow key={courseItem.id}>
                <TableCell>{courseItem.courseCode}</TableCell>
                <TableCell>{courseItem.courseName}</TableCell>
                <TableCell>{courseItem.lecturer}</TableCell>
                <TableCell>{courseItem.year}</TableCell>
                <TableCell>{courseItem.semester}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => showCourseStudents(courseItem)}>
                    <AddCircleIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => goToEditCourse(courseItem)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => deleteSelectedCourse(courseItem.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* דיאלוג סטודנטים בקורס */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Students Enrolled in Course</DialogTitle>
        <DialogContent>
          {studentsInCourse.length > 0 ? (
            <List>
              {studentsInCourse.map((student) => (
                <ListItem
                  key={student.studentId}
                  secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => removeStudentFromCourse(student.studentId)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={`${student.fullName} (${student.studentId})`} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ my: 2 }}>No students enrolled in this course.</Typography>
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <Select
              displayEmpty
              value={studentIdToAssign}
              onChange={(e) => setStudentIdToAssign(e.target.value)}
            >
              <MenuItem value="" disabled>Select a student to assign</MenuItem>
              {studentList
                .filter((student) =>
                  courseToView && !(student.courses || []).includes(courseToView.courseCode)
                )
                .map((student) => (
                  <MenuItem key={student.studentId} value={student.studentId}>
                    {student.fullName}
                  </MenuItem>
                ))}
            </Select>
            <Button sx={{ mt: 1 }} onClick={assignStudentToCourse} variant="outlined">
              Assign Student
            </Button>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
