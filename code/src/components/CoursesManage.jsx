
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
import { listCourses, deleteCourse as deleteCourse, updateCourse } from "../firebase/course";

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

  async function deleteSelectedCourse(courseCodeToDelete) {
    await deleteCourse(courseCodeToDelete);
    const updatedCourseList = courseList.filter(function(course) {
      return course.courseCode !== courseCodeToDelete;
    });
    setCourseList(updatedCourseList);
  }

  function showCourseStudents(courseObject) {
    const matchedStudents = studentList.filter(function(student) {
      const courseCodes = student.courses || [];
      return courseCodes.includes(courseObject.courseCode);
    });
    setCourseToView(courseObject);
    setStudentsInCourse(matchedStudents);
    setIsDialogOpen(true);
  }


// פונקציה שמסירה סטודנט מקורס מסוים
async function removeStudentFromCourse(studentIdToRemove) {
  // יצירת רשימה חדשה שתכיל את הסטודנטים לאחר העדכון
  const updatedStudents = studentList.map(async function(student) {

    // בדיקה אם זה הסטודנט שצריך להסיר מהקורס
    if (student.studentId === studentIdToRemove) {

      // מקבל את רשימת הקורסים של הסטודנט (אם קיימת), ומסנן ממנה את הקורס הנוכחי
      const updatedCourses = (student.courses || []).filter(function(courseCode) {
        return courseCode !== courseToView.courseCode;
      });

      // יצירת אובייקט חדש של הסטודנט עם רשימת הקורסים החדשה (בלי הקורס שהוסר)
      const updatedStudentObject = {
        ...student,
        courses: updatedCourses
      };

      // עדכון הסטודנט במסד הנתונים (Firestore)
      await updateStudent(updatedStudentObject);

      // החזרת הסטודנט המעודכן לרשימה
      return updatedStudentObject;

    } else {
      // אם זה לא הסטודנט שאנחנו מסירים – נחזיר אותו כמו שהוא
      return student;
    }
  });

  // עדכון רשימת כל הסטודנטים ב-state עם הרשימה החדשה
  setStudentList(updatedStudents);

  // יצירת רשימה חדשה של סטודנטים בקורס הנוכחי – בלי הסטודנט שהוסר
  const updatedCourseStudents = studentsInCourse.filter(function(student) {
    return student.studentId !== studentIdToRemove;
  });

  // עדכון רשימת הסטודנטים של הקורס הנבחר בדיאלוג
  setStudentsInCourse(updatedCourseStudents);
}


  async function assignStudentToCourse() { // זו פונקציה אסינכרונית שמבצעת את שיוך הסטודנט לקורס הנבחר.

    if (!courseToView || studentIdToAssign === "") return; //אם אין קורס שנבחר לצפייה (courseToView) או שלא נבחר סטודנט – הפונקציה לא ממשיכה

    const selectedStudent = studentList.find(function(student) {
      return student.studentId === studentIdToAssign;
    }); //מחפש את הסטודנט מתוך רשימת כל הסטודנטים לפי המספר מזהה (studentId) שנבחר.

    if (!selectedStudent) return; // אם לא נמצא סטודנט מתאים – מפסיקים את הפעולה.

    //לוקחים את כל הקורסים של אותו סטודנט (או מערך ריק אם אין לו עדיין) ומוסיפים אליהם את הקורס שנבחר לצפייה.
    const updatedCourses = [...(selectedStudent.courses || []), courseToView.courseCode];

    //יוצרים אובייקט חדש של הסטודנט עם רשימת הקורסים המעודכנת.
    const updatedStudent = { ...selectedStudent, courses: updatedCourses };

    await updateStudent(updatedStudent); // מעדכנים את המידע הזה בפועל במסד הנתונים (Firestore).


//מעדכנים את הרשימה המקומית (studentList) – מחליפים את הסטודנט הישן בחדש, וכל השאר נשארים כפי שהם.
    const updatedList = studentList.map(function(student) {
      return student.studentId === updatedStudent.studentId ? updatedStudent : student;
    });
    
    setStudentList(updatedList); //📥 שמים את הרשימה החדשה ב־useState של studentList.

    showCourseStudents(courseToView);//👁️ מרעננים את הרשימה של הסטודנטים שמוצגים בדיאלוג לפי הקורס.

    setStudentIdToAssign("");//🔄 מאפסים את השדה של בחירת סטודנט – כך שהשדה יחזור לריק.


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
                <TableRow key={courseItem.courseCode}>
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
                    <Button size="small" color="error" onClick={() => deleteSelectedCourse(courseItem.courseCode)}>
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

