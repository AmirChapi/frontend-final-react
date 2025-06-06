import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';          // דוגמאות לאייקונים
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import MessageIcon from '@mui/icons-material/Message';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';

import { useNavigate, useLocation } from 'react-router-dom';

export default function SideDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  const menuItems = [
    { text: 'Home Page', path: '/', icon: <HomeIcon /> },
    { text: 'Students Manage', path: '/StudentsManage', icon: <PeopleIcon /> },
    { text: 'Courses Manage', path: '/CoursesManage', icon: <SchoolIcon /> },
    { text: 'Tasks Manage', path: '/TaskManage', icon: <AssignmentIcon /> },
    { text: 'Grades Manage', path: '/GradeManage', icon: <GradeIcon /> },
    { text: 'Message Manage', path: '/MessageManage', icon: <MessageIcon /> },
    { text: 'Help', path: '/help', icon: <HelpIcon /> },
    { text: 'Student Info', path: '/info', icon: <InfoIcon /> },
  ];

  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const list = () => (
    <Box
      sx={{ width: 250, backgroundColor: '#ebdfd1', height: '100%' }} // רקע תכלת בהיר לתפריט
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item, index) => {
          const isSelected = location.pathname === item.path;

          return (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => handleMenuItemClick(item.path)}
                sx={{
                  backgroundColor: isSelected ? '#c0aa92' : 'transparent', // תכלת כהה לפריט נבחר
                  color: isSelected ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor: isSelected ? '#c0aa92' : '#c0aa92',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? 'white' : 'black' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
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
        <MenuIcon sx={{ color: '#000' }} />
      </IconButton>
      <Drawer open={isOpen} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </div>
  );
}
