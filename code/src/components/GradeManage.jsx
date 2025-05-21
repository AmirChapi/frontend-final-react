import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { listGrades, deleteGrade } from "../firebase/grade"; // פונקציות פיירסטור
import { listTasks } from "../firebase/task"; // אם יש צורך במטלות
import { listStudents } from "../firebase/student"; // אם יש צורך במטלות}

export default function GradesManage() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  // טוען את הנתונים מ-Firestore
  useEffect(() => {
    const fetchData = async () => {
      const gradesData = await listGrades();
      const studentsData = await listStudents();
      const tasksData = await listTasks();
      setGrades(gradesData);
      setStudents(studentsData);
      setTasks(tasksData);
    };

    fetchData();
  }, []);

  // הוספת ציון חדש
  const handleAddGrade = () => {
    navigate("/GradeForm");
  };

  // עריכת ציון
  const handleEdit = (grade) => {
    navigate("/GradeForm", { state: { gradeToEdit: grade } });
  };

  // מחיקת ציון
  const handleDelete = async (gradeId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this grade?");
    if (confirmDelete) {
      await deleteGrade(gradeId);
      setGrades(prev => prev.filter(grade => grade.id !== gradeId));
    }
  };

  // מחפש את שם הסטודנט לפי תעודת זהות
  const getStudentName = (idNumber) => {
    const student = students.find(s => s.studentId === idNumber);
    return student ? student.fullName : idNumber;
  };

  // מחפש את שם המטלה לפי קוד מטלה
  const getTaskName = (taskCode) => {
    const task = tasks.find(t => t.taskCode === taskCode);
    return task ? task.taskName : taskCode;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        ניהול ציונים
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" onClick={handleAddGrade}>
          הוסף ציון חדש
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>תעודת זהות</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>שם סטודנט</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>קוד מטלה</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>שם מטלה</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>ציון</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>{grade.idNumber}</TableCell>
                <TableCell>{getStudentName(grade.idNumber)}</TableCell>
                <TableCell>{grade.taskCode}</TableCell>
                <TableCell>{getTaskName(grade.taskCode)}</TableCell>
                <TableCell>{grade.taskGrade}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <IconButton color="info" onClick={() => handleEdit(grade)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(grade.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {grades.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  לא נמצאו ציונים.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
