// TasksManage.jsx - Task Management Page (Styled to match other admin pages)

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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { listTasks, deleteTask } from "../firebase/task";
import { listCourses } from "../firebase/course";

export default function TasksManage() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const tasksData = await listTasks();
      const coursesData = await listCourses();
      setTasks(tasksData);
      setCourses(coursesData);
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

  const handleEdit = (task) => {
    navigate("/TaskForm", { state: { taskToEdit: task } });
  };

  const getCourseName = (courseCode) => {
    const course = courses.find((c) => c.courseCode === courseCode);
    return course ? course.courseName : courseCode;
  };

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Task Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Course Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Course Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Task Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Submission Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
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
            ))}
            {tasks.length === 0 && (
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