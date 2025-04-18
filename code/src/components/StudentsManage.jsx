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
import IconButton from '@mui/material/IconButton'; // Import IconButton
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';     // Import EditIcon
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// --- Placeholder Data (Email Removed) ---
const placeholderAllStudents = [
    { id: '123456789', name: 'Alice Wonderland', year: '2023' }, // Example 9-digit ID
    { id: '987654321', name: 'Bob The Builder', year: '2022' },
    { id: '112233445', name: 'Charlie Chaplin', year: '2024' },
    { id: '556677889', name: 'Diana Prince', year: '2021' },
];
// --- End Placeholder Data ---

// --- LocalStorage Key for Students ---
const STUDENTS_STORAGE_KEY = 'studentsList';

// --- Helper Functions for LocalStorage (Moved outside for potential reuse) ---
const getStoredData = (key) => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            return Array.isArray(parsedData) ? parsedData : null;
        }
    } catch (error) {
        console.error(`Error parsing data from localStorage key "${key}":`, error);
    }
    return null;
};

const saveDataToStorage = (key, data) => {
    try {
        if (!Array.isArray(data)) {
            console.error(`Attempted to save non-array data to localStorage key "${key}".`);
            return false; // Indicate failure
        }
        localStorage.setItem(key, JSON.stringify(data));
        return true; // Indicate success
    } catch (error) {
        console.error(`Failed to save data to localStorage key "${key}":`, error);
        return false; // Indicate failure
    }
};
// --- End Helper Functions ---

// --- Get User Info (including Role) from Local Storage ---
const getCurrentUser = () => {
    const role = localStorage.getItem('userRole');
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
    const [feedback, setFeedback] = useState({ type: '', message: '' }); // For delete/error feedback
    const navigate = useNavigate();

    const currentUser = getCurrentUser();
    const isAdmin = currentUser?.role === 'administrator';

    // --- Load Students ---
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        setFeedback({ type: '', message: '' }); // Clear feedback on load

        const timer = setTimeout(() => {
            try {
                let studentsData = getStoredData(STUDENTS_STORAGE_KEY);

                if (studentsData === null) {
                    // console.log("No students in localStorage or data invalid, using placeholder and saving.");
                    studentsData = placeholderAllStudents;
                    saveDataToStorage(STUDENTS_STORAGE_KEY, studentsData);
                }
                setStudents(studentsData);
            } catch (err) {
                console.error("Error loading students:", err);
                setError('Failed to load student data.');
                setStudents([]);
            } finally {
                setIsLoading(false);
            }
        }, 50); // Short delay

        return () => clearTimeout(timer);
    }, []); // Empty dependency array means this runs once on mount

    // --- Action Handlers ---
    const handleAddStudentClick = () => {
        // Navigate to the form in 'add' mode (no state passed)
        navigate('/StudentsForm');
    };

    const handleEdit = (studentToEdit) => {
        // Navigate to the form, passing the student object in state for 'edit' mode
        console.log("Editing student:", studentToEdit);
        // Note: StudentsForm needs to be updated to handle this state
        navigate('/StudentsForm', { state: { studentToEdit: studentToEdit } });
    };

    const handleDelete = (studentIdToDelete) => {
        // Confirmation dialog
        if (window.confirm(`Are you sure you want to delete student ${studentIdToDelete}? This action cannot be undone.`)) {
            try {
                const updatedStudents = students.filter(student => student.id !== studentIdToDelete);
                const success = saveDataToStorage(STUDENTS_STORAGE_KEY, updatedStudents);

                if (success) {
                    setStudents(updatedStudents); // Update state to reflect deletion in UI
                    setFeedback({ type: 'success', message: `Student ${studentIdToDelete} deleted successfully.` });
                } else {
                    setFeedback({ type: 'error', message: 'Failed to save changes after deletion.' });
                }
            } catch (err) {
                console.error("Error deleting student:", err);
                setFeedback({ type: 'error', message: 'An error occurred while deleting the student.' });
            }
            // Clear feedback message after a few seconds
            setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
        }
    };
    // --- End Action Handlers ---

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, margin: 'auto', mt: 4, px: 2 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" component="h1" gutterBottom sx={{ mb: { xs: 1, md: 0 } }}>
                    Manage Students
                </Typography>

                {/* Conditional Admin Button */}
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddStudentClick}
                        title="Add a new student to the system"
                    >
                        Add Student
                    </Button>
                )}
            </Box>

            {/* Feedback Area */}
            {feedback.message && (
                <Alert severity={feedback.type || 'info'} sx={{ mb: 2 }}>
                    {feedback.message}
                </Alert>
            )}

            {/* Loading and Error States */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {/* Student Table */}
            {!isLoading && !error && students.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="students table">
                        <TableHead sx={{ backgroundColor: 'primary.light' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Year</TableCell>
                                {/* Actions Header - Only for Admins */}
                                {isAdmin && <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>}
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
                                    <TableCell align="right">{student.year || 'N/A'}</TableCell>
                                    {/* Actions Cell - Only for Admins */}
                                    {isAdmin && (
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(student)} // Pass the whole student object
                                                title="Edit Student"
                                                color="primary"
                                            >
                                                <EditIcon fontSize="inherit" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(student.id)}
                                                title="Delete Student"
                                                color="error"
                                                sx={{ ml: 1 }} // Add some margin
                                            >
                                                <DeleteIcon fontSize="inherit" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}

            {/* No Students Found State */}
            {!isLoading && !error && students.length === 0 && (
                 <Alert severity="info" sx={{ mt: 2 }}>
                     No students found in the system. {isAdmin ? 'Use the "Add Student" button above to add one.' : ''}
                 </Alert>
            )}
        </Box>
    );
}
