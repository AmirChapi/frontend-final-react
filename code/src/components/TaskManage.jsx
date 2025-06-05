// TasksManage.jsx - Task Management Page (Filtered to Tasks Relevant to Selected Student)

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Stack,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { listTasks, deleteTask } from "../firebase/task";
import { listCourses } from "../firebase/course";
import { listStudent } from "../firebase/student";

export default function TasksManage() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const tasksData = await listTasks();
      const coursesData = await listCourses();
      const studentsData = await listStudent();
      const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));

      if (selectedStudent) {
        const studentData = studentsData.find(s => s.studentId === selectedStudent.studentId);
        const studentCourseCodes = studentData?.courses || [];
        const filteredTasks = tasksData.filter(task => studentCourseCodes.includes(task.courseCode));
        setTasks(filteredTasks);
      } else {
        setTasks(tasksData);
      }

      setCourses(coursesData);
      setStudents(studentsData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAddTask = () => {
    navigate("/TaskForm");
  };

  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task? This action cannot be undone.");
    if (confirmDelete) {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    }
  };

  // ✅ שינוי כאן:
  const handleEdit = (task) => {
    navigate(`/TaskForm/${task.id}`);
  };

  const getCourseName = (courseCode) => {
    const course = courses.find((c) => c.courseCode === courseCode);
    return course ? course.courseName : courseCode;
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Task Management
      </Typography>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
        <Button variant="contained" color="primary" onClick={handleAddTask}>
          Add New Task
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Existing Tasks
      </Typography>

      <TableContainer component={Paper} sx={{ border: "1px solid black" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#add8e6" }}>Task Code</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#add8e6" }}>Course Code</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#add8e6" }}>Course Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#add8e6" }}>Task Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#add8e6" }}>Submission Date</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#add8e6" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#add8e6" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.taskCode}</TableCell>
                  <TableCell>{task.courseCode}</TableCell>
                  <TableCell>{getCourseName(task.courseCode)}</TableCell>
                  <TableCell>{task.taskName}</TableCell>
                  <TableCell>{task.submissionDate}</TableCell>
                  <TableCell>{task.taskDescription}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton color="info" onClick={() => handleEdit(task)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(task.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
