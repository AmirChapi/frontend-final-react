import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SideDropdownMenu from './SideDropdownMenu';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#003366' }}>
      <Toolbar>
        {/* Left side: Dropdown menu */}
        <SideDropdownMenu />

        {/* Logo and Title (clickable) */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={handleHomeClick}
        >
          <Box
            component="img"
            src="/mha-logo.png" // make sure the logo is in the /public folder
            alt="MHA Logo"
            sx={{ height: 110, width: 110, mr: 1 }}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            MHA College
          </Typography>
        </Box>

        {/* Optional right-side actions can go here */}
        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
    </AppBar>
  );
}
