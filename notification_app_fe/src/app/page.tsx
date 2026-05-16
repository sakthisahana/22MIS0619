'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Navbar from '@/components/Navbar';
import NotificationCard from '@/components/NotificationCard';
import { Notification, NotificationType } from '@/types/notification';
import { fetchNotifications } from './api-utils';

const SEEN_KEY = 'seen_notification_ids';

function getSeenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function markSeen(ids: string[]) {
  if (typeof window === 'undefined') return;
  const seen = getSeenIds();
  ids.forEach(id => seen.add(id));
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

export default function HomePage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | ''>('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNotifications({
        limit,
        page,
        notification_type: filterType || undefined,
      });

      const seen = getSeenIds();
      const withNew = data.map(n => ({ ...n, isNew: !seen.has(n.ID) }));
      setNotifications(withNew);
      markSeen(data.map(n => n.ID));

      // Estimate total pages (API may not return total)
      setTotalPages(data.length < limit ? page : page + 1);
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [limit, page, filterType]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (_: any, val: NotificationType | '') => {
    setFilterType(val ?? '');
    setPage(1);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* Header */}
        <Box mb={2}>
          <Typography variant="h5" fontWeight={700}>All Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            Showing all campus updates — new ones highlighted in blue
          </Typography>
        </Box>

        {/* Controls */}
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={2}>
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleFilterChange}
            size="small"
          >
            <ToggleButton value="">All</ToggleButton>
            <ToggleButton value="Placement">Placement</ToggleButton>
            <ToggleButton value="Result">Result</ToggleButton>
            <ToggleButton value="Event">Event</ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Per page</InputLabel>
            <Select
              value={limit}
              label="Per page"
              onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              {[5, 10, 15, 20].map(n => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Content */}
        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!loading && !error && notifications.length === 0 && (
          <Alert severity="info">No notifications found.</Alert>
        )}

        {!loading && notifications.map(n => (
          <NotificationCard key={n.ID} notification={n} />
        ))}

        {/* Pagination */}
        {!loading && notifications.length > 0 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              color="primary"
            />
          </Box>
        )}
      </Container>
    </>
  );
}
