'use client';

import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { Notification } from '@/types/notification';

interface Props {
  notification: Notification;
  rank?: number;
}

const TYPE_CONFIG = {
  Placement: { color: 'primary' as const,   icon: <WorkIcon fontSize="small" />,   bg: '#e3f2fd' },
  Result:    { color: 'secondary' as const, icon: <SchoolIcon fontSize="small" />, bg: '#e0f2f1' },
  Event:     { color: 'warning' as const,   icon: <EventIcon fontSize="small" />,  bg: '#fff8e1' },
};

export default function NotificationCard({ notification, rank }: Props) {
  const config = TYPE_CONFIG[notification.Type] || TYPE_CONFIG.Event;

  const formattedTime = (() => {
    try {
      const d = new Date(notification.Timestamp.replace(' ', 'T'));
      return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return notification.Timestamp; }
  })();

  return (
    <Card
      sx={{
        mb: 1.5,
        border: notification.isNew ? '2px solid #1565C0' : '1px solid #e0e0e0',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          {/* Rank badge */}
          {rank !== undefined && (
            <Box
              sx={{
                minWidth: 28, height: 28, borderRadius: '50%',
                bgcolor: 'primary.main', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0, mt: 0.3,
              }}
            >
              {rank}
            </Box>
          )}

          {/* Icon */}
          <Box
            sx={{
              width: 36, height: 36, borderRadius: 2,
              bgcolor: config.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {config.icon}
          </Box>

          {/* Content */}
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.3}>
              <Chip
                label={notification.Type}
                color={config.color}
                size="small"
                sx={{ height: 20, fontSize: 11 }}
              />
              {notification.isNew && (
                <Chip
                  icon={<FiberNewIcon />}
                  label="New"
                  color="error"
                  size="small"
                  sx={{ height: 20, fontSize: 11 }}
                />
              )}
            </Box>
            <Typography variant="body2" fontWeight={600} noWrap title={notification.Message}>
              {notification.Message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formattedTime}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
