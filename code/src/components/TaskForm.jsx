// src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'; // Import Button
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs'; // Import dayjs for date formatting

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

// --- Helper Functions for LocalStorage (No try...catch) ---
const saveTasksToStorage = (tasks) => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    console.log("TaskForm: Saved tasks to localStorage.");
};

const getStoredTasks = () => {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    let parsedTasks = null;

    if (storedTasks) {
        parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
            console.log("TaskForm: Found valid tasks in localStorage.");
            return parsedTasks;
        } else {
            console.warn("TaskForm: Data in localStorage for tasks was not an array. Using placeholders.");
        }
    } else {
        console.log("TaskForm: No tasks found in localStorage. Using placeholders.");
    }

    console.log("TaskForm: Saving placeholder tasks to localStorage.");
    saveTasksToStorage(placeholderTasks);
    return placeholderTasks;
};
// --- End Helper Functions ---


export default function TaskForm() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        console.log("TaskForm: Loading tasks...");

        const timer = setTimeout(() => {
            const tasksData = getStoredTasks();
            setTasks(tasksData);
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);

    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    // --- Navigation Handler ---
    const handleAddTask = () => {
        // Navigate to the route where TaskManage is used for adding tasks
        // Adjust '/task-manage/new' to your actual route
        navigate('/TaskManage');
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
                    <Table sx={{ minWidth: 650 }} aria-label="tasks table">
                        <TableHead sx={{ backgroundColor: 'primary.light' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Assignment Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Course Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Assignment Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}

            {/* No Tasks Found State */}
            {!isLoading && !error && tasks.length === 0 && (
                 <Alert severity="info" sx={{ mt: 2 }}>
                     No tasks found in the system. Add one using the button above!
                 </Alert>
            )}
        </Box>
    );
}
