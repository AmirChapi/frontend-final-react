// src/components/StudentsManage.jsx
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
import ButtonGroup from '@mui/material/ButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// --- Placeholder Data ---
const placeholderAllStudents = [
    { id: '12345', name: 'Alice Wonderland', email: 'alice@example.com', year: 3 },
    { id: '67890', name: 'Bob The Builder', email: 'bob@example.com', year: 2 },
    { id: '11223', name: 'Charlie Chaplin', email: 'charlie@example.com', year: 4 },
    { id: '44556', name: 'Diana Prince', email: 'diana@example.com', year: 1 },
];
// --- End Placeholder Data ---

// --- Get User Info (including Role) from Local Storage ---
// Reads the role set by LoginSimulation.jsx
const getCurrentUser = () => {
    const role = localStorage.getItem('userRole');
    console.log("StudentsManage - User role from localStorage:", role); // For debugging
    // Return a user object structure consistent with previous usage
    return {
        id: role === 'administrator' ? 'admin001' : 'student001', // Placeholder ID based on role
        username: role === 'administrator' ? 'admin_user' : 'student_user', // Placeholder username
        role: role || 'student' // Default to 'student' if nothing is set
    };
};
// --- End Get User Info ---


export default function StudentsManage() {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Get current user information (including role from localStorage)
    const currentUser = getCurrentUser();
    const isAdmin = currentUser?.role === 'administrator';

    useEffect(() => {
       // TODO: Replace with your actual API call to fetch students
        setIsLoading(true);
        setError(null);
        // Using placeholder data for now
        setTimeout(() => {
            setStudents(placeholderAllStudents);
            setIsLoading(false);
        }, 700); // Simulate network delay

    }, []); // Runs once on component mount

    // --- Navigation Handlers ---
    const handleAddCourseClick = () => {
        navigate('/CourseForm'); // Navigate to Add Course page
    };

    const handleAddAssignmentClick = () => {
        // TODO: Create and navigate to the Add Assignment page/component
        console.log("Navigate to Add Assignment Form");
        // navigate('/AssignmentForm'); // Example route
        alert("Add Assignment functionality not yet implemented.");
    };

    const handleAddGradeClick = () => {
        // TODO: Create and navigate to the Add Grade page/component
        console.log("Navigate to Add Grade Form");
        // navigate('/GradeForm'); // Example route
        alert("Add Grade functionality not yet implemented.");
    };
    // --- End Navigation Handlers ---

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, margin: 'auto', mt: 4, px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" component="h1" gutterBottom sx={{ mb: { xs: 1, md: 0 } }}>
                    Manage Students
                </Typography>

                {/* --- Conditional Admin Buttons --- */}
                {/* This will now show/hide based on localStorage value */}
                {isAdmin && (
                    <ButtonGroup variant="contained" aria-label="admin actions button group">
                         <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddCourseClick}
                            title="Add a new course to the system"
                        >
                            Add Course
                        </Button>
                        <Button
                            startIcon={<AssignmentIcon />}
                            onClick={handleAddAssignmentClick}
                            title="Add a new assignment"
                        >
                            Add Assignment
                        </Button>
                        <Button
                            startIcon={<GradeIcon />}
                            onClick={handleAddGradeClick}
                            title="Add a grade for a student/assignment"
                        >
                            Add Grade
                        </Button>
                    </ButtonGroup>
                )}
                {/* --- End Conditional Admin Buttons --- */}
            </Box>

            {/* --- Loading and Error States --- */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {/* --- Student Table --- */}
            {!isLoading && !error && students.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="students table">
                        <TableHead sx={{ backgroundColor: 'primary.light' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Year</TableCell>
                                {/* Add Actions column if admins can edit/delete/view details per student */}
                                {/* {isAdmin && <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>} */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow
                                    key={student.id}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {student.id}
                                    </TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell align="right">{student.year || 'N/A'}</TableCell>
                                    {/* Example Actions Cell (implement buttons/icons as needed) */}
                                    {/* {isAdmin && (
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => {}} title="View Details"><VisibilityIcon fontSize="inherit" /></IconButton>
                                            <IconButton size="small" onClick={() => {}} title="Edit Student"><EditIcon fontSize="inherit" /></IconButton>
                                        </TableCell>
                                    )} */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                 !isLoading && !error && <Alert severity="info" sx={{ mt: 2 }}>No students found in the system.</Alert>
            )}
        </Box>
    );
}
