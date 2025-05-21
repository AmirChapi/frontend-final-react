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

// export default function GradeManage() {
//   const [grades, setGrades] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedGrades = JSON.parse(localStorage.getItem("grades")) || [];
//     setGrades(storedGrades);
//   }, []);

//   const handleAddGrade = () => {
//     navigate("/GradeForm");
//   };

//   const handleEdit = (grade) => {
//     navigate("/GradeForm", { state: { gradeToEdit: grade } });
//   };

//   const handleDelete = (indexToDelete) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this grade?"
//     );
//     if (confirmDelete) {
//       const updatedGrades = grades.filter((_, index) => index !== indexToDelete);
//       setGrades(updatedGrades);
//       localStorage.setItem("grades", JSON.stringify(updatedGrades));
//     }
//   };

//   return (
//     <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
//       <Typography variant="h5" gutterBottom>
//         Grade Management
//       </Typography>

//       <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
//         <Button
//           variant="contained"
//           sx={{ backgroundColor: "#1976d2" }}
//           onClick={handleAddGrade}
//         >
//           ADD NEW GRADE
//         </Button>
//       </Box>

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead sx={{ backgroundColor: "#1976d2" }}>
//             <TableRow>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID Number</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Task Name</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Task Code</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold" }}>Grade</TableCell>
//               <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
//                 Actions
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {grades.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5} align="center">
//                   No grades found.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               grades.map((grade, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{grade.idNumber}</TableCell>
//                   <TableCell>{grade.taskName}</TableCell>
//                   <TableCell>{grade.taskCode}</TableCell>
//                   <TableCell>{grade.taskGrade}</TableCell>
//                   <TableCell align="center">
//                     <Stack direction="row" spacing={0.5} justifyContent="center">
//                       <IconButton color="info" onClick={() => handleEdit(grade)}>
//                         <EditIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton color="error" onClick={() => handleDelete(index)}>
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Stack>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// }


// GradesManage.jsx - ניהול ציונים
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

export default function GradesManage() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedGrades = JSON.parse(localStorage.getItem("grades")) || [];
    const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    setGrades(storedGrades);
    setStudents(storedStudents);
    setTasks(storedTasks);
  }, []);

  const handleAddGrade = () => {
    navigate("/GradeForm");
  };

  const handleEdit = (grade) => {
    navigate("/GradeForm", { state: { gradeToEdit: grade } });
  };

  const handleDelete = (indexToDelete) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this grade?");
    if (confirmDelete) {
      const updatedGrades = grades.filter((_, index) => index !== indexToDelete);
      setGrades(updatedGrades);
      localStorage.setItem("grades", JSON.stringify(updatedGrades));
    }
  };

  const getStudentName = (idNumber) => {
    const student = students.find(s => s.studentId === idNumber);
    return student ? student.fullName : idNumber;
  };

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
            {grades.map((grade, index) => (
              <TableRow key={index}>
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
                    <IconButton color="error" onClick={() => handleDelete(index)}>
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
