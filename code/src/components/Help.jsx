// src/components/Help.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; 
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton'; 
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link'; 
import MessageIcon from '@mui/icons-material/Message';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';

const ListItemLink = (props) => {
  const { icon, primary, secondary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef(function Link(itemProps, ref) {
        return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
      }),
    [to],
  );

  return (
    <li>
      <ListItemButton component={renderLink}>
{icon ? (
  <ListItemIcon>
    {React.cloneElement(icon, { sx: { color: '#8c6e54' } })}
  </ListItemIcon>
) : null}
    <ListItemText primary={primary} secondary={secondary} />
      </ListItemButton>
    </li>
  );
}

export default function Help() {
  return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{
  p: 3,
  borderRadius: 4,
  border: '2.5px solid #ebdfd1',
  backgroundColor: '#fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
}}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Help & Guidance
        </Typography>
        <Typography variant="body1" paragraph align="center" sx={{ mb: 3 }}>
          Welcome to the application! Click on an item below to navigate to the relevant section:
        </Typography>

        <List component="nav" aria-label="help sections">
          <ListItemLink
            to="/"
            primary="Homepage"
            secondary="The main landing page after logging in."
            icon={<HomeIcon color="primary" />}
          />
          <Divider component="li" />
          <ListItemLink
            to="/MessageManage"
            primary="Message Management"
            secondary="View, edit, delete, and add new system messages. Click here to manage messages."
            icon={<MessageIcon color="primary" />}
          />
          <Divider component="li" />

          <ListItemLink
            to="/StudentsManage"
            primary="Student Management"
            secondary="Manage student information. Click here to view and manage student records."
            icon={<PeopleIcon color="primary" />}
          />
          <Divider component="li" />

          <ListItemLink
            to="/CoursesManage"
            primary="Course Management"
            secondary="Manage course details. Click here to view and manage course information."
            icon={<SchoolIcon color="primary" />}
          />
          <Divider component="li" />

          <ListItemLink
            to="/TaskManage"
            primary="Task/Assignment Management"
            secondary="Manage assignments or tasks associated with courses. Click here to manage tasks."
            icon={<AssignmentIcon color="primary" />}
          />
          <Divider component="li" />

           <ListItemLink
            to="/info"
            primary="Information"
            secondary="Find general information or details about the application."
            icon={<InfoIcon color="primary" />}
          />
        </List>

        <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic', textAlign: 'center' }}>
          You can also use the navigation bar at the top to access these sections.
        </Typography>
      </Box>
    </Container>
    </Box>
  );
}
