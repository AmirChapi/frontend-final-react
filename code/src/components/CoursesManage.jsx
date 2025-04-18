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
import IconButton from '@mui/material/IconButton'; // Import IconButton
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';     // Import EditIcon
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
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


// --- Get User Role from Local Storage ---
const getCurrentUserRole = () => {
    const role = localStorage.getItem('userRole');
    // console.log("CoursesManage - User role from localStorage:", role);
    return role || 'student';
};
// --- End Get User Role ---


export default function CoursesManage() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState({ type: '', message: '' }); // For delete/error feedback
    const navigate = useNavigate();

    const userRole = getCurrentUserRole();
    const isAdmin = userRole === 'administrator';

    // --- Load Courses ---
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        setFeedback({ type: '', message: '' }); // Clear feedback on load
        // console.log("Loading courses from localStorage...");

        const timer = setTimeout(() => {
            try {
                let coursesData = getStoredData(COURSES_STORAGE_KEY);

                if (coursesData === null) {
                    // console.log("No courses in localStorage or data invalid, using placeholder and saving.");
                    coursesData = placeholderAllCourses;
                    saveDataToStorage(COURSES_STORAGE_KEY, coursesData);
                }
                setCourses(coursesData);
            } catch (err) { // Catch errors from potential issues in helpers
                console.error("Error loading courses:", err);
                setError('Failed to load course data.');
                setCourses([]);
            } finally {
                setIsLoading(false);
            }
        }, 50); // Short delay

        return () => clearTimeout(timer);
    }, []);

    // --- Action Handlers ---
    const handleAddCourseClick = () => {
        // Navigate to the form in 'add' mode (no state passed)
        navigate('/CourseForm');
    };

    const handleEdit = (courseToEdit) => {
        // Navigate to the form, passing the course object in state for 'edit' mode
        console.log("Editing course:", courseToEdit);
        navigate('/CourseForm', { state: { courseToEdit: courseToEdit } });
    };

    const handleDelete = (courseIdToDelete) => {
        // Confirmation dialog
        if (window.confirm(`Are you sure you want to delete course ${courseIdToDelete}? This action cannot be undone.`)) {
            try {
                const updatedCourses = courses.filter(course => course.id !== courseIdToDelete);
                const success = saveDataToStorage(COURSES_STORAGE_KEY, updatedCourses);

                if (success) {
                    setCourses(updatedCourses); // Update state to reflect deletion
                    setFeedback({ type: 'success', message: `Course ${courseIdToDelete} deleted successfully.` });
                } else {
                    setFeedback({ type: 'error', message: 'Failed to save changes after deletion.' });
                }
            } catch (err) {
                console.error("Error deleting course:", err);
                setFeedback({ type: 'error', message: 'An error occurred while deleting the course.' });
            }
            // Clear feedback message after a few seconds
            setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
        }
    };
    // --- End Action Handlers ---


    return (
        <Box sx={{ width: '100%', maxWidth: 1100, margin: 'auto', mt: 4, px: 2 }}> {/* Increased max width slightly */}
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

            {/* Feedback Area */}
            {feedback.message && (
                <Alert severity={feedback.type || 'info'} sx={{ mb: 2 }}>
                    {feedback.message}
                </Alert>
            )}

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
                    <Table sx={{ minWidth: 750 }} aria-label="courses table"> {/* Adjusted minWidth */}
                        <TableHead sx={{ backgroundColor: 'primary.light' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Course ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Course Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Lecturer</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Year</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Semester</TableCell>
                                {isAdmin && <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>} {/* Actions Header */}
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
                                    <TableCell align="center">{course.semester}</TableCell>
                                    {/* Actions Cell - Only for Admins */}
                                    {isAdmin && (
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(course)} // Pass the whole course object
                                                title="Edit Course"
                                                color="primary"
                                            >
                                                <EditIcon fontSize="inherit" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(course.id)}
                                                title="Delete Course"
                                                color="error"
                                                sx={{ ml: 1 }} // Add some margin between buttons
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

            {/* No Courses Found State */}
            {!isLoading && !error && courses.length === 0 && (
                 <Alert severity="info" sx={{ mt: 2 }}>
                     No courses found in the system. {isAdmin ? 'Use the button above to add one.' : ''}
                 </Alert>
            )}
        </Box>
    );
}
