import { Notification, FetchParams, NotificationsResponse } from '@/types/notification';

const API_BASE = 'http://4.224.186.213/evaluation-service/notifications';

// ⚠️ Replace with your actual Bearer token
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzYWt0aGlkaGFrc2gxMDEyQGdtYWlsLmNvbSIsImV4cCI6MTc3ODkzMDU1OCwiaWF0IjoxNzc4OTI5NjU4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMGFmNTlhMjAtMjRkMC00NzMyLTk1NGYtNWYwNzI1MWQ5OWZiIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2FrdGhpIHNhaGFuYSBkIiwic3ViIjoiNDE0MjA3NzItODBjNC00MjFlLWE0NzMtYjUzZGQ5Zjc0ZGZlIn0sImVtYWlsIjoic2FrdGhpZGhha3NoMTAxMkBnbWFpbC5jb20iLCJuYW1lIjoic2FrdGhpIHNhaGFuYSBkIiwicm9sbE5vIjoiMjJtaXMwNjE5IiwiYWNjZXNzQ29kZSI6IlNmRnVXZyIsImNsaWVudElEIjoiNDE0MjA3NzItODBjNC00MjFlLWE0NzMtYjUzZGQ5Zjc0ZGZlIiwiY2xpZW50U2VjcmV0IjoiR0pQZGhkcmZyZG53VGZ5USJ9.ltWI-IBAaEspPqQ3VANnd_OlDPHXq8i3fLIyXSckPdM';

export async function fetchNotifications(params: FetchParams = {}): Promise<Notification[]> {
  const url = new URL(API_BASE);

  if (params.limit)             url.searchParams.set('limit', String(params.limit));
  if (params.page)              url.searchParams.set('page', String(params.page));
  if (params.notification_type) url.searchParams.set('notification_type', params.notification_type);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: ${res.status} ${res.statusText}`);
  }

  const data: NotificationsResponse = await res.json();
  return data.notifications || [];
}

export function getTypeWeight(type: string): number {
  switch (type) {
    case 'Placement': return 3;
    case 'Result':    return 2;
    case 'Event':     return 1;
    default:          return 0;
  }
}

export function computePriorityScore(n: Notification, maxTime: Date): number {
  const time = new Date(n.Timestamp.replace(' ', 'T'));
  const diffMs = maxTime.getTime() - time.getTime();
  const maxMs = 7 * 24 * 60 * 60 * 1000;
  const recencyScore = 1 - Math.min(diffMs / maxMs, 1);
  return getTypeWeight(n.Type) * 1000 + recencyScore * 999;
}

export function getPriorityNotifications(notifications: Notification[], topN: number): Notification[] {
  if (!notifications.length) return [];
  const maxTime = notifications.reduce((max, n) => {
    const t = new Date(n.Timestamp.replace(' ', 'T'));
    return t > max ? t : max;
  }, new Date(0));

  return [...notifications]
    .sort((a, b) => computePriorityScore(b, maxTime) - computePriorityScore(a, maxTime))
    .slice(0, topN);
}
