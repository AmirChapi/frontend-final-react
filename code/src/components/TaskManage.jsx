// src/components/TaskManage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton'; // Import IconButton
import EditIcon from '@mui/icons-material/Edit'; // Import EditIcon
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
import dayjs from 'dayjs';

// --- LocalStorage Key for Tasks ---
const TASKS_STORAGE_KEY = 'Task';

// --- Static Placeholder Tasks (Copied from TaskManage for consistency) ---
const placeholderTasks = Array.from({ length: 10 }, (_, i) => {
    const code = (101 + i).toString();
    const courseIndex = i % 3;
    const courses = ['CS101', 'MA202', 'PH305'];
    const submissionDate = dayjs().add(i + 7, 'day').toISOString();

    return {
        assignmentCode: code,
        courseCode: courses[courseIndex],
        assignmentName: `Placeholder Task ${i + 1}`,
        submissionDate: submissionDate,
        description: `This is a static placeholder description for task ${code}.`,
    };
});
// --- End Static Placeholder Tasks ---

// --- Helper Functions for LocalStorage ---
const saveTasksToStorage = (tasks) => {
    try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        console.log("TaskManage: Saved tasks to localStorage.");
    } catch (error) {
        console.error("TaskManage: Failed to save tasks to localStorage:", error);
        // Optionally, inform the user about the error
    }
};

const getStoredTasks = () => {
    try {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            if (Array.isArray(parsedTasks)) {
                console.log("TaskManage: Found valid tasks in localStorage.");
                return parsedTasks;
            } else {
                console.warn("TaskManage: Data in localStorage for tasks was not an array. Using placeholders.");
            }
        } else {
            console.log("TaskManage: No tasks found in localStorage. Using placeholders.");
        }
    } catch (error) {
        console.error("TaskManage: Error parsing tasks from localStorage. Using placeholders.", error);
    }

    // If storage was empty, invalid, or parsing failed
    console.log("TaskManage: Saving placeholder tasks to localStorage.");
    saveTasksToStorage(placeholderTasks); // Save placeholders if needed
    return placeholderTasks;
};
// --- End Helper Functions ---


export default function TaskManage() { // Renamed component to TaskManage
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --- Load Tasks ---
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        console.log("TaskManage: Loading tasks...");

        // Simulate async loading (optional, remove if not needed)
        const timer = setTimeout(() => {
            try {
                const tasksData = getStoredTasks();
                setTasks(tasksData);
            } catch (err) {
                console.error("TaskManage: Error loading tasks:", err);
                setError("Failed to load tasks. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }, 100); // Short delay to show loading indicator

        return () => clearTimeout(timer); // Cleanup timer on unmount

    }, []);

    // --- Format Date ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    // --- Navigation Handlers ---
    const handleAddTask = () => {
        // Navigate to the form for adding a new task
        // The TaskForm component handles the 'add' mode by default
        navigate('/TaskForm');
    };

    const handleEdit = (taskToEdit) => {
        // Navigate to the form for editing, passing the task data
        // The TaskForm component should use this data to pre-fill the form
        console.log("Navigating to edit task:", taskToEdit);
        navigate('/TaskForm', { state: { taskToEdit: taskToEdit } });
    };

    // --- Delete Handler ---
    const handleDelete = (assignmentCodeToDelete) => {
        // Confirmation dialog
        if (window.confirm(`Are you sure you want to delete task ${assignmentCodeToDelete}?`)) {
            console.log("Deleting task:", assignmentCodeToDelete);
            try {
                const updatedTasks = tasks.filter(task => task.assignmentCode !== assignmentCodeToDelete);
                setTasks(updatedTasks); // Update state
                saveTasksToStorage(updatedTasks); // Update localStorage
                console.log("Task deleted successfully.");
            } catch (err) {
                console.error("TaskManage: Error deleting task:", err);
                setError("Failed to delete task. Please try again.");
                // Optionally revert state if save fails, though localStorage errors are less common here
            }
        } else {
            console.log("Deletion cancelled for task:", assignmentCodeToDelete);
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 1100, margin: 'auto', mt: 4, px: 2 }}>
            {/* Header and Add Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h1">
                    Tasks Overview
                </Typography>
                <Button variant="contained" onClick={handleAddTask}>
                    Add New Task
                </Button>
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

            {/* Task Table */}
            {!isLoading && !error && tasks.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 750 }} aria-label="tasks table"> {/* Increased minWidth */}
                        <TableHead sx={{ backgroundColor: 'primary.light' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Assignment Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Course Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Assignment Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell> {/* Added Action Header */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow
                                    key={task.assignmentCode}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {task.assignmentCode}
                                    </TableCell>
                                    <TableCell>{task.courseCode}</TableCell>
                                    <TableCell>{task.assignmentName}</TableCell>
                                    <TableCell>{formatDate(task.submissionDate)}</TableCell>
                                    <TableCell>{task.description || '-'}</TableCell>
                                    {/* Action Buttons Cell */}
                                    <TableCell align="center">
                                        <IconButton
                                            aria-label="edit"
                                            size="small"
                                            onClick={() => handleEdit(task)} // Pass the whole task object
                                            sx={{ mr: 0.5 }} // Add some margin between buttons
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            aria-label="delete"
                                            size="small"
                                            color="error" // Make delete button red
                                            onClick={() => handleDelete(task.assignmentCode)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}

            {/* No Tasks Found State */}
            {!isLoading && !error && tasks.length === 0 && (
                 <Alert severity="info" sx={{ mt: 2 }}>
                     No tasks found. Use the "Add New Task" button to create one.
                 </Alert>
            )}
        </Box>
    );
}
