import React from 'react'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SideDropdownMenu from './SideDropdownMenu';




export default function Header() {
    
    return (
        <AppBar position="static" >

            <Toolbar >
                <SideDropdownMenu />
                <Typography variant="h6" component="div">

                    Grade Insight
                </Typography>
            </Toolbar>
        </AppBar>


    );
}
