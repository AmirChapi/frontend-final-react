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
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3d3d3d' }}
      >
        Task Management
      </Typography>

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
        Tasks relevant to the selected student.
      </Typography>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleAddTask}
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
          Add New Task
        </Button>
      </Box>

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
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#ebdfd1" }}>Task Code</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#ebdfd1" }}>Course Code</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#ebdfd1" }}>Course Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#ebdfd1" }}>Task Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#ebdfd1" }}>Submission Date</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#ebdfd1" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#ebdfd1" }}>Actions</TableCell>
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
