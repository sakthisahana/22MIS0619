export type NotificationType = 'Placement' | 'Result' | 'Event';

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
  isNew?: boolean; // tracked on frontend
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface FetchParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType | '';
}
