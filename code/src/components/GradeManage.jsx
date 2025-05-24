// GradesManage.jsx - Grade Management Page (Filtered by Task Code from Message)

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
  Stack,
  LinearProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { listGrades, deleteGrade } from "../firebase/grade";
import { listStudent } from "../firebase/student";
import { listTasks } from "../firebase/task";

export default function GradesManage() {
  const [grades, setGrades] = useState([]); // ציונים לסינון והצגה
  const [students, setStudents] = useState([]); // כל הסטודנטים
  const [tasks, setTasks] = useState([]); // כל המטלות
  const navigate = useNavigate(); // מאפשר ניווט לעמודים
    const [loading, setLoading] = useState(true);

  const location = useLocation(); // משמש לקריאת state מניווט קודם

  useEffect(() => {
    async function fetchData() {
      const [gradesData, studentsData, tasksData] = await Promise.all([
        listGrades(),
        listStudent(),
        listTasks(),
              

      ]);

      const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));
      const taskCodeToFilter = location.state?.filterTaskCode || null; // אם עברנו מדף ההודעות, יהיה כאן קוד מטלה

      let filteredGrades = gradesData;

      // אם יש סטודנט נבחר - מסננים רק את הציונים שלו
      if (selectedStudent) {
        filteredGrades = filteredGrades.filter(g => g.idNumber === selectedStudent.studentId);
      }

      // אם עברנו מקוד מטלה ספציפי - נסנן עוד יותר לפי קוד המטלה
      if (taskCodeToFilter) {
        filteredGrades = filteredGrades.filter(g => g.taskCode === taskCodeToFilter);
      }

      setGrades(filteredGrades);
      setStudents(studentsData);
      setTasks(tasksData);
      setLoading(false);
    }

    fetchData();
  }, [location.state]); // מריץ שוב את הקוד אם location.state משתנה

  const handleAddGrade = () => {
    navigate("/GradeForm");
  };

  const handleEdit = (grade) => {
    navigate("/GradeForm", { state: { gradeToEdit: grade } });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this grade?");
    if (confirm) {
      await deleteGrade(id);
      setGrades((prev) => prev.filter((grade) => grade.id !== id));
    }
  };

  const getStudentName = (idNumber) => {
    const student = students.find((s) => s.studentId === idNumber);
    return student ? student.fullName : idNumber;
  };

  const getTaskName = (taskCode) => {
    const task = tasks.find((t) => t.taskCode === taskCode);
    return task ? task.taskName : taskCode;
  };

    if (loading) {
    return <LinearProgress />;
  }
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Grade Management
      </Typography>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
        <Button variant="contained" color="primary" onClick={handleAddGrade}>
          Add New Grade
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Existing Grades
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Task Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Task Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.length > 0 ? (
              grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>{grade.idNumber}</TableCell>
                  <TableCell>{getStudentName(grade.idNumber)}</TableCell>
                  <TableCell>{grade.taskCode}</TableCell>
                  <TableCell>{getTaskName(grade.taskCode)}</TableCell>
                  <TableCell>{grade.taskGrade}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="info" onClick={() => handleEdit(grade)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(grade.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No grades found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
