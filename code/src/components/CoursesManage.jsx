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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CourseManage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("coursesList")) || [];
    setCourses(storedCourses);
  }, []);
  
  const handleAddCourse = () => {
    navigate("/CourseForm");
  };

  const handleEdit = (course) => {
    navigate("/CourseForm", { state: { courseToEdit: course } });
  };

  const handleDelete = (indexToDelete) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (confirmDelete) {
      const updatedCourses = courses.filter((_, index) => index !== indexToDelete);
      setCourses(updatedCourses);
      localStorage.setItem("coursesList", JSON.stringify(updatedCourses));
    }
  };


  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Course Management
      </Typography>

      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#1976d2" }}
          onClick={handleAddCourse}
        >
          ADD NEW COURSE
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Course Code</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Course Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lecturer</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>year</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>semester</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Function</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course, index) => (
                <TableRow key={index}>
                  <TableCell>{course.courseCode}</TableCell>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>{course.lecturer}</TableCell>
                  <TableCell>{course.year}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                      onClick={() => handleEdit(course)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </Button>
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
