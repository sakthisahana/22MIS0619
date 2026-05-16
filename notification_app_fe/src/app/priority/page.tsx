'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Navbar from '@/components/Navbar';
import NotificationCard from '@/components/NotificationCard';
import { Notification } from '@/types/notification';
import { fetchNotifications, getPriorityNotifications } from '../api-utils';

export default function PriorityPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [prioritized, setPrioritized] = useState<Notification[]>([]);
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch a large batch for proper priority ranking
      const data = await fetchNotifications({ limit: 100 });
      setAllNotifications(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (allNotifications.length) {
      setPrioritized(getPriorityNotifications(allNotifications, topN));
    }
  }, [allNotifications, topN]);

  const counts = {
    Placement: prioritized.filter(n => n.Type === 'Placement').length,
    Result:    prioritized.filter(n => n.Type === 'Result').length,
    Event:     prioritized.filter(n => n.Type === 'Event').length,
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 3 }}>

        {/* Header */}
        <Box mb={2}>
          <Typography variant="h5" fontWeight={700}>⭐ Priority Inbox</Typography>
          <Typography variant="body2" color="text.secondary">
            Top N most important notifications — ranked by type weight &amp; recency
          </Typography>
        </Box>

        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Show top <strong>{topN}</strong> notifications
            </Typography>
            <Slider
              value={topN}
              min={5}
              max={30}
              step={5}
              marks={[5, 10, 15, 20, 25, 30].map(v => ({ value: v, label: String(v) }))}
              onChange={(_, val) => setTopN(val as number)}
              color="primary"
              sx={{ maxWidth: 400 }}
            />

            {/* Stats */}
            {!loading && prioritized.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" gap={3} flexWrap="wrap">
                  {(['Placement', 'Result', 'Event'] as const).map(type => (
                    <Box key={type} textAlign="center">
                      <Typography variant="h6" color="primary.main">{counts[type]}</Typography>
                      <Typography variant="caption" color="text.secondary">{type}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Priority legend */}
        <Card sx={{ mb: 2, bgcolor: '#e3f2fd' }}>
          <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Priority order:</strong>&nbsp;
              🏆 Placement (weight 3) &gt; 📚 Result (weight 2) &gt; 📅 Event (weight 1)
              &nbsp;· Recency breaks ties within same type
            </Typography>
          </CardContent>
        </Card>

        {/* Content */}
        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && prioritized.length === 0 && (
          <Alert severity="info">No notifications available.</Alert>
        )}

        {!loading && prioritized.map((n, i) => (
          <NotificationCard key={n.ID} notification={n} rank={i + 1} />
        ))}

      </Container>
    </>
  );
}
