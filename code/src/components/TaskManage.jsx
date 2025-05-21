// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   IconButton,
//   Stack,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";

// export default function TasksManage() {
//   const [tasks, setTasks] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     setTasks(storedTasks);
//   }, []);

//   const handleAddTask = () => {
//     navigate("/TaskForm");
//   };

//   const handleDelete = (indexToDelete) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this task? This action cannot be undone."
//     );

//     if (confirmDelete) {
//       const updatedTasks = tasks.filter((_, index) => index !== indexToDelete);
//       setTasks(updatedTasks);
//       localStorage.setItem("tasks", JSON.stringify(updatedTasks));
//     }
//   };

//   const handleEdit = (task) => {
//     navigate("/TaskForm", { state: { taskToEdit: task } });
//   };

//   return (
//     <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
//       <Typography variant="h5" gutterBottom>
//         Task Management
//       </Typography>

//       <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
//         <Button
//           variant="contained"
//           sx={{ backgroundColor: "#1976d2" }}
//           onClick={handleAddTask}
//         >
//           ADD NEW TASK
//         </Button>
//       </Box>

//       <TableContainer component={Paper}>
//         <Table aria-label="task table">
//           <TableHead sx={{ backgroundColor: "#1976d2" }}>
//             <TableRow>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Task Code</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Course Code</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Task Name</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Submission Date</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Description</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {tasks.map((task, index) => (
//               <TableRow key={index}>
//                 <TableCell>{task.taskCode}</TableCell>
//                 <TableCell>{task.courseCode}</TableCell>
//                 <TableCell>{task.taskName}</TableCell>
//                 <TableCell>{task.submissionDate}</TableCell>
//                 <TableCell>{task.taskDescription}</TableCell>
//                 <TableCell align="center">
//                   <Stack direction="row" spacing={0.5} justifyContent="center">
//                     <IconButton color="info" onClick={() => handleEdit(task)}>
//                       <EditIcon fontSize="small" />
//                     </IconButton>
//                     <IconButton color="error" onClick={() => handleDelete(index)}>
//                       <DeleteIcon fontSize="small" />
//                     </IconButton>
//                   </Stack>
//                 </TableCell>
//               </TableRow>
//             ))}
//             {tasks.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={6} align="center">
//                   No tasks found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// }


// TasksManage.jsx - קומפוננטה מלאה לניהול מטלות
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

export default function TasksManage() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
    setTasks(storedTasks);
    setCourses(storedCourses);
  }, []);

  const handleAddTask = () => {
    navigate("/TaskForm");
  };

  const handleDelete = (indexToDelete) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone."
    );

    if (confirmDelete) {
      const updatedTasks = tasks.filter((_, index) => index !== indexToDelete);
      setTasks(updatedTasks);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    }
  };

  const handleEdit = (task) => {
    navigate("/TaskForm", { state: { taskToEdit: task } });
  };

  const getCourseName = (courseCode) => {
    const course = courses.find(c => c.courseCode === courseCode);
    return course ? course.courseName : courseCode;
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Task Management
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#1976d2" }}
          onClick={handleAddTask}
        >
          ADD NEW TASK
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="task table">
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Task Code</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Course Code</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Course Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Task Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Submission Date</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, index) => (
              <TableRow key={index}>
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
                    <IconButton color="error" onClick={() => handleDelete(index)}>
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
