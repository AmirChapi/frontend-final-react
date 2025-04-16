import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function SideDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  const menuItems = [
    { text: 'Students Manage', path: '/StudentsManage' },
    { text: 'Courses Manage', path: '/CoursesManage' },
    { text: 'MSG Manage', path: '/MSGManage' },
    {text: 'Login Simulation', path: '/LoginSimulation'},
    {text: 'Home Page', path: '/'},
    {text: 'Help', path: '/help'},
    {text: 'Info', path: '/info'},
    ];

  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsOpen(false); // Close the drawer after navigation
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={() => handleMenuItemClick(item.path)}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
        onClick={toggleDrawer(true)}
      >
        <MenuIcon />
      </IconButton>
      <Drawer open={isOpen} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </div>
  );
}
