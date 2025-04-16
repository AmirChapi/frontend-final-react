// src/components/CoursesManage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// --- Placeholder Data (Used only if localStorage is empty) ---
const placeholderAllCourses = [
    { id: 'CS101', name: 'Introduction to Computer Science', lecturer: 'Dr. Alan Turing', year: 2023, semester: 'A' },
    { id: 'MA201', name: 'Calculus II', lecturer: 'Prof. Ada Lovelace', year: 2023, semester: 'A' },
    { id: 'PHY105', name: 'Classical Mechanics', lecturer: 'Dr. Isaac Newton', year: 2023, semester: 'B' },
    { id: 'ENG210', name: 'Literature and Composition', lecturer: 'Prof. Jane Austen', year: 2024, semester: 'A' },
    { id: 'HIS300', name: 'World History', lecturer: 'Dr. Herodotus', year: 2024, semester: 'B' },
];
// --- End Placeholder Data ---

// --- LocalStorage Key for Courses ---
const COURSES_STORAGE_KEY = 'coursesList';

// --- Get User Role from Local Storage ---
const getCurrentUserRole = () => {
    const role = localStorage.getItem('userRole');
    console.log("CoursesManage - User role from localStorage:", role);
    return role || 'student';
};
// --- End Get User Role ---


export default function CoursesManage() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Keep error state if needed for actual API calls later
    const navigate = useNavigate();

    const userRole = getCurrentUserRole();
    const isAdmin = userRole === 'administrator';

    // Effect to load courses from localStorage when the component mounts
    useEffect(() => {
        setIsLoading(true);
        setError(null); // Reset error on load
        console.log("Loading courses from localStorage...");

        // Simulate loading delay slightly
        setTimeout(() => {
            try {
                const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
                let coursesData = [];

                if (storedCourses) {
                    console.log("Found courses in localStorage.");
                    coursesData = JSON.parse(storedCourses);
                } else {
                    // If nothing in storage, use placeholder and save it
                    console.log("No courses in localStorage, using placeholder and saving.");
                    coursesData = placeholderAllCourses;
                    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(coursesData));
                }
                setCourses(coursesData);
            } catch (err) {
                console.error("Error loading/parsing courses from localStorage:", err);
                setError('Failed to load course data. Storage might be corrupted.');
                // Optionally clear corrupted storage: localStorage.removeItem(COURSES_STORAGE_KEY);
                setCourses([]); // Set to empty array on error
            } finally {
                setIsLoading(false);
            }
        }, 100); // Short delay for simulation

    }, []); // Empty dependency array means this runs once on mount

    const handleAddCourseClick = () => {
        navigate('/CourseForm');
    };

    // ... (rest of the component remains the same) ...

    return (
        <Box sx={{ width: '100%', maxWidth: 900, margin: 'auto', mt: 4, px: 2 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" component="h1" gutterBottom sx={{ mb: { xs: 1, md: 0 } }}>
                    Manage Courses
                </Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddCourseClick}
                        title="Add a new course to the system"
                    >
                        Add New Course
                    </Button>
                )}
            </Box>

            {/* Loading State */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error State */}
            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Course Table */}
            {!isLoading && !error && courses.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="courses table">
                        <TableHead sx={{ backgroundColor: 'primary.light' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Course ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Course Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Lecturer</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Year</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Semester</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow
                                    key={course.id}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">{course.id}</TableCell>
                                    <TableCell>{course.name}</TableCell>
                                    <TableCell>{course.lecturer}</TableCell>
                                    <TableCell align="right">{course.year}</TableCell>
                                    <TableCell align="right">{course.semester}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}

            {/* No Courses Found State */}
            {!isLoading && !error && courses.length === 0 && (
                 <Alert severity="info" sx={{ mt: 2 }}>
                     No courses found in the system. {isAdmin ? 'Use the button above to add one.' : ''}
                 </Alert>
            )}
        </Box>
    );
}
