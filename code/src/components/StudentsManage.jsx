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
// Removed ButtonGroup, AssignmentIcon, GradeIcon as they are no longer needed
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// --- Placeholder Data (Used only if localStorage is empty) ---
const placeholderAllStudents = [
    { id: '12345', name: 'Alice Wonderland', email: 'alice@example.com', year: '2023' }, // Ensure year is string if form saves it as string
    { id: '67890', name: 'Bob The Builder', email: 'bob@example.com', year: '2022' },
    { id: '11223', name: 'Charlie Chaplin', email: 'charlie@example.com', year: '2024' },
    { id: '44556', name: 'Diana Prince', email: 'diana@example.com', year: '2021' },
];
// --- End Placeholder Data ---

// --- LocalStorage Key for Students (Ensure this matches StudentsForm.jsx) ---
const STUDENTS_STORAGE_KEY = 'studentsList';

// --- Get User Info (including Role) from Local Storage ---
// Reads the role set by LoginSimulation.jsx
const getCurrentUser = () => {
    const role = localStorage.getItem('userRole');
    console.log("StudentsManage - User role from localStorage:", role); // For debugging
    return {
        id: role === 'administrator' ? 'admin001' : 'student001',
        username: role === 'administrator' ? 'admin_user' : 'student_user',
        role: role || 'student'
    };
};
// --- End Get User Info ---


export default function StudentsManage() {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const currentUser = getCurrentUser();
    const isAdmin = currentUser?.role === 'administrator';

    // --- Effect to load students from localStorage ---
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        console.log("StudentsManage: Loading students from localStorage...");

        // Simulate loading delay slightly
        setTimeout(() => {
            try {
                const storedStudents = localStorage.getItem(STUDENTS_STORAGE_KEY);
                let studentsData = [];

                if (storedStudents) {
                    const parsedData = JSON.parse(storedStudents);
                    // Basic validation: check if it's an array
                    if (Array.isArray(parsedData)) {
                        console.log("StudentsManage: Found students in localStorage.");
                        studentsData = parsedData;
                    } else {
                        console.warn("StudentsManage: Data in localStorage is not an array. Using placeholder.");
                        studentsData = placeholderAllStudents;
                        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(studentsData)); // Save placeholders if data was invalid
                    }
                } else {
                    // If nothing in storage, use placeholder and save it
                    console.log("StudentsManage: No students in localStorage, using placeholder and saving.");
                    studentsData = placeholderAllStudents;
                    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(studentsData));
                }
                setStudents(studentsData);
            } catch (err) {
                console.error("StudentsManage: Error loading/parsing students from localStorage:", err);
                setError('Failed to load student data. Storage might be corrupted.');
                // Optionally clear corrupted storage: localStorage.removeItem(STUDENTS_STORAGE_KEY);
                setStudents([]); // Set to empty array on error
            } finally {
                setIsLoading(false);
            }
        }, 100); // Short delay for simulation

    }, []); // Empty dependency array means this runs once on mount

    // --- Navigation Handler for Adding a Student ---
    const handleAddStudentClick = () => {
        console.log("Navigating to Add Student Form...");
        navigate('/StudentsForm');
    };
    // --- End Navigation Handler ---

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, margin: 'auto', mt: 4, px: 2 }}>
            {/* Header Section - Simplified Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" component="h1" gutterBottom sx={{ mb: { xs: 1, md: 0 } }}>
                    Manage Students
                </Typography>

                {/* --- Conditional Admin Button --- */}
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddStudentClick}
                        title="Add a new student to the system"
                    >
                        Add Student
                    </Button>
                    // Removed ButtonGroup as it's not needed for a single button
                )}
                {/* --- End Conditional Admin Button --- */}
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
                                {/* Optional Actions column */}
                                {/* {isAdmin && <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>} */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow
                                    key={student.id} // Ensure student objects have unique 'id'
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {student.id}
                                    </TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell align="right">{student.year || 'N/A'}</TableCell>
                                    {/* Optional Actions Cell */}
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
            ) : null} {/* Render nothing if loading, error, or empty */}

            {/* No Students Found State - Improved Message */}
            {!isLoading && !error && students.length === 0 && (
                 <Alert severity="info" sx={{ mt: 2 }}>
                     No students found in the system. {isAdmin ? 'Use the "Add Student" button above to add one.' : ''}
                 </Alert>
            )}
        </Box>
    );
}
