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

export default function GradeManage() {
  const [grades, setGrades] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedGrades = JSON.parse(localStorage.getItem("grades")) || [];
    setGrades(storedGrades);
  }, []);

  const handleAddGrade = () => {
    navigate("/GradeForm");
  };

  const handleEdit = (grade) => {
    navigate("/GradeForm", { state: { gradeToEdit: grade } });
  };

  const handleDelete = (indexToDelete) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this grade?"
    );
    if (confirmDelete) {
      const updatedGrades = grades.filter((_, index) => index !== indexToDelete);
      setGrades(updatedGrades);
      localStorage.setItem("grades", JSON.stringify(updatedGrades));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Grade Management
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#1976d2" }}
          onClick={handleAddGrade}
        >
          ADD NEW GRADE
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID Number</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Task Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Task Code</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Grade</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No grades found.
                </TableCell>
              </TableRow>
            ) : (
              grades.map((grade, index) => (
                <TableRow key={index}>
                  <TableCell>{grade.idNumber}</TableCell>
                  <TableCell>{grade.taskName}</TableCell>
                  <TableCell>{grade.taskCode}</TableCell>
                  <TableCell>{grade.taskGrade}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton color="info" onClick={() => handleEdit(grade)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
