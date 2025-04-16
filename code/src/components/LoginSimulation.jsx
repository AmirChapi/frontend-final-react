// src/components/LoginSimulation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function LoginSimulation() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(localStorage.getItem('userRole') || ''); // Show current role if set

    const handleLogin = (role) => {
        console.log(`Simulating login as: ${role}`);
        localStorage.setItem('userRole', role); // Save role to localStorage
        setSelectedRole(role); // Update state to show confirmation
        // Optionally navigate away after selection
        // navigate('/'); // Navigate to home page after selection
        // Or navigate to a specific dashboard based on role
        // if (role === 'administrator') {
        //     navigate('/StudentsManage');
        // } else {
        //     navigate('/'); // Or a student-specific dashboard
        // }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh', // Center vertically
                p: 3,
            }}
        >
            <Paper elevation={3} sx={{ padding: 4, textAlign: 'center', maxWidth: 400 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    Simulate Login
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Choose the role you want to simulate for this session. This will affect which management buttons are visible.
                </Typography>

                {selectedRole && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Currently simulating as: <strong>{selectedRole}</strong>
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<PersonIcon />}
                        onClick={() => handleLogin('student')}
                    >
                        Login as Student
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        startIcon={<AdminPanelSettingsIcon />}
                        onClick={() => handleLogin('administrator')}
                    >
                        Login as Administrator
                    </Button>
                </Box>
                 <Typography variant="caption" display="block" sx={{ mt: 3, color: 'text.secondary' }}>
                    Selection is saved in local storage. Close and reopen the tab or clear storage to reset.
                </Typography>
            </Paper>
        </Box>
    );
}
