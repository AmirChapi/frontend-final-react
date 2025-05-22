// CoursesManage.jsx - Course Management Page (Fixed deletion functionality)

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
    navigate("/CourseForm", { state: { courseToEdit: courseObject } });
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
    const matchedStudents = studentList.filter(function(student) {
      const courseCodes = student.courses || [];
      return courseCodes.includes(courseObject.courseCode);
    });
    setCourseToView(courseObject);
    setStudentsInCourse(matchedStudents);
    setIsDialogOpen(true);
  }

  async function removeStudentFromCourse(studentIdToRemove) {
    const updatedStudents = await Promise.all(
      studentList.map(async function(student) {
        if (student.studentId === studentIdToRemove) {
          const updatedCourses = (student.courses || []).filter(function(courseCode) {
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

    const updatedCourseStudents = studentsInCourse.filter(function(student) {
      return student.studentId !== studentIdToRemove;
    });
    setStudentsInCourse(updatedCourseStudents);
  }

  async function assignStudentToCourse() {
    if (!courseToView || studentIdToAssign === "") return;

    const selectedStudent = studentList.find(function(student) {
      return student.studentId === studentIdToAssign;
    });

    if (!selectedStudent) return;

    const updatedCourses = [...(selectedStudent.courses || []), courseToView.courseCode];
    const updatedStudent = { ...selectedStudent, courses: updatedCourses };
    await updateStudent(updatedStudent);

    const updatedList = studentList.map(function(student) {
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
      <Typography variant="h4" gutterBottom>Course Management</Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ marginBottom: 3 }}
        onClick={() => navigate("/CourseForm")}
      >
        Add New Course
      </Button>

      <Typography variant="h6" gutterBottom>Existing Courses</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Lecturer</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courseList.map(function(courseItem) {
              return (
                <TableRow key={courseItem.id}>
                  <TableCell>{courseItem.courseCode}</TableCell>
                  <TableCell>{courseItem.courseName}</TableCell>
                  <TableCell>{courseItem.lecturer}</TableCell>
                  <TableCell>{courseItem.year}</TableCell>
                  <TableCell>{courseItem.semester}</TableCell>
                  <TableCell>
                    <Button size="small" color="info" onClick={() => showCourseStudents(courseItem)}>
                      View Students
                    </Button>
                    <Button size="small" color="secondary" onClick={() => goToEditCourse(courseItem)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => deleteSelectedCourse(courseItem.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Students Enrolled in Course</DialogTitle>
        <DialogContent>
          {studentsInCourse.length > 0 ? (
            <List>
              {studentsInCourse.map(function(student) {
                return (
                  <ListItem
                    key={student.studentId}
                    secondaryAction={
                      <IconButton edge="end" color="error" onClick={() => removeStudentFromCourse(student.studentId)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={student.fullName + " (" + student.studentId + ")"} />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography sx={{ marginY: 2 }}>No students enrolled in this course.</Typography>
          )}

          <FormControl fullWidth sx={{ marginTop: 2 }}>
            <Select
              displayEmpty
              value={studentIdToAssign}
              onChange={(e) => setStudentIdToAssign(e.target.value)}
            >
              <MenuItem value="" disabled>Select a student to assign</MenuItem>
              {studentList
                .filter(function(student) {
                  const courseCodes = student.courses || [];
                  return courseToView && !courseCodes.includes(courseToView.courseCode);
                })
                .map(function(student) {
                  return (
                    <MenuItem key={student.studentId} value={student.studentId}>{student.fullName}</MenuItem>
                  );
                })}
            </Select>
            <Button sx={{ marginTop: 1 }} onClick={assignStudentToCourse} variant="outlined">Assign Student</Button>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}