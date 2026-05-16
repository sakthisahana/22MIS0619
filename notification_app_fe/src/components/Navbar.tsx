'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        <NotificationsIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Campus Notifications
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            component={Link}
            href="/"
            color="inherit"
            variant={pathname === '/' ? 'outlined' : 'text'}
            startIcon={<NotificationsIcon />}
            size="small"
          >
            All
          </Button>
          <Button
            component={Link}
            href="/priority"
            color="inherit"
            variant={pathname === '/priority' ? 'outlined' : 'text'}
            startIcon={<StarIcon />}
            size="small"
          >
            Priority
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
