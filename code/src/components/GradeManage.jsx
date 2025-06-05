// GradeManage.jsx

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
  IconButton,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { listGrades, deleteGrade } from "../firebase/grade";
import { listStudent } from "../firebase/student";
import { listTasks } from "../firebase/task";

export default function GradeManage() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));
const selectedStudentId = selectedStudent?.studentId;

  useEffect(() => {
    async function loadData() {
      const [gradesData, studentsData, tasksData] = await Promise.all([
        listGrades(),
        listStudent(),
        listTasks(),
      ]);
      setGrades(gradesData);
      setStudents(studentsData);
      setTasks(tasksData);
      setLoading(false);
    }
    loadData();
  }, []);

  const getStudentName = (idNumber) => {
    const student = students.find((s) => s.studentId === idNumber);
    return student ? student.fullName : "";
  };

  const getTaskName = (taskCode) => {
    const task = tasks.find((t) => t.taskCode === taskCode);
    return task ? task.taskName : "";
  };

  const handleEdit = (grade) => {
    navigate(`/GradeForm/${grade.id}`);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this grade?");
    if (confirm) {
      await deleteGrade(id);
      setGrades(grades.filter((g) => g.id !== id));
    }
  };

  const filteredGrades = grades.filter(
    (grade) => grade.idNumber === selectedStudentId
  );

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Grade Management
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 3 }}
        onClick={() => navigate("/GradeForm")}
      >
        Add New Grade
      </Button>
      <TableContainer component={Paper} sx={{ border: "1px solid black" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#add8e6" }}>Student</TableCell>
              <TableCell sx={{ backgroundColor: "#add8e6" }}>Task</TableCell>
              <TableCell sx={{ backgroundColor: "#add8e6" }}>Grade</TableCell>
              <TableCell sx={{ backgroundColor: "#add8e6" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGrades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>{getStudentName(grade.idNumber)}</TableCell>
                <TableCell>{getTaskName(grade.taskCode)}</TableCell>
                <TableCell>{grade.taskGrade}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(grade)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(grade.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
