// GradesManage.jsx - Grade Management Page (Styled to match other admin pages)

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
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { listGrades, deleteGrade } from "../firebase/grade";
import { listStudent } from "../firebase/student";
import { listTasks } from "../firebase/task";
import { addMessage } from "../firebase/message";

export default function GradesManage() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskCode, setSelectedTaskCode] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const [gradesData, studentsData, tasksData] = await Promise.all([
        listGrades(),
        listStudent(),
        listTasks(),
      ]);
      setGrades(gradesData);
      setStudents(studentsData);
      setTasks(tasksData);
    }

    fetchData();
  }, []);

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

  const handleDistributeGrades = async () => {
    const gradesForTask = grades.filter((g) => g.taskCode === selectedTaskCode);
    const task = tasks.find((t) => t.taskCode === selectedTaskCode);
    const taskName = task ? task.taskName : selectedTaskCode;

    for (let i = 0; i < gradesForTask.length; i++) {
      const grade = gradesForTask[i];
      await addMessage({
        messageCode: `${grade.idNumber}_${grade.taskCode}`,
        messageContent: `Your grade for "${taskName}" (${grade.taskCode}) is ${grade.taskGrade}.`,
        courseCode: task?.courseCode || "",
        assignmentCode: grade.taskCode,
        studentId: grade.idNumber,
      });
    }
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Grade Management
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary" onClick={handleAddGrade}>
          Add New Grade
        </Button>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={selectedTaskCode}
            displayEmpty
            onChange={(e) => setSelectedTaskCode(e.target.value)}
          >
            <MenuItem value="" disabled>Select task to distribute grades</MenuItem>
            {tasks.map((task) => (
              <MenuItem key={task.taskCode} value={task.taskCode}>
                {task.taskCode} - {task.taskName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          disabled={!selectedTaskCode}
          onClick={handleDistributeGrades}
        >
          Distribute Grades
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Grades distributed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
