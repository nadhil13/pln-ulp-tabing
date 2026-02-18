import { UserRole } from './index';

export interface Notification {
  id: string;
  title: string;
  message: string;
  targetRole: UserRole | 'all';
  timestamp: Date;
  createdBy: string;
  createdByName: string;
  readBy?: string[];
  read?: boolean;
}

export interface NotificationFormData {
  title: string;
  message: string;
  targetRole: UserRole | 'all';
}
