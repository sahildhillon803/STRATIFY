import { apiClient } from './api.client';
import type { Notification } from '@/types/notification.types';
import { useNotificationStore } from '@/stores/notification.store';

// Fetch notifications from API
export const fetchNotifications = async (): Promise<Notification[]> => {
  const store = useNotificationStore.getState();
  store.setLoading(true);
  store.setError(null);
  
  try {
    // Try to fetch from API
    const response = await apiClient.get<{ notifications?: Notification[] }>('/notifications');
    const notifications = response.notifications || [];
    store.setNotifications(notifications);
    return notifications;
  } catch {
    // If API doesn't exist yet, generate notifications based on dashboard data
    const notifications = await generateNotificationsFromDashboard();
    store.setNotifications(notifications);
    return notifications;
  } finally {
    store.setLoading(false);
  }
};

// Generate notifications based on actual dashboard/financial data
const generateNotificationsFromDashboard = async (): Promise<Notification[]> => {
  const notifications: Notification[] = [];
  
  try {
    // Fetch runway data to generate relevant notifications
    const runway = await apiClient.get<{
      cash_balance: number;
      monthly_burn_rate: number;
      runway_months: number;
      status: string;
    }>('/financials/runway');
    
    // Runway warning notification
    if (runway.runway_months > 0 && runway.runway_months < 6) {
      notifications.push({
        id: 'runway-warning',
        title: 'Runway Alert',
        message: `Your runway is ${runway.runway_months.toFixed(1)} months. Consider reducing expenses or raising capital.`,
        type: 'warning',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/',
      });
    }
    
    // Critical runway notification
    if (runway.runway_months > 0 && runway.runway_months < 3) {
      notifications.push({
        id: 'runway-critical',
        title: 'Critical Runway Warning',
        message: `Your runway is critically low at ${runway.runway_months.toFixed(1)} months. Immediate action required.`,
        type: 'error',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/scenarios',
      });
    }
    
    // High burn rate notification
    if (runway.monthly_burn_rate > 50000) {
      notifications.push({
        id: 'burn-rate-high',
        title: 'High Burn Rate',
        message: `Your monthly burn rate is $${runway.monthly_burn_rate.toLocaleString()}. Review expenses in Analytics.`,
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        link: '/',
      });
    }
    
    // Positive cash flow notification
    if (runway.monthly_burn_rate < 0) {
      notifications.push({
        id: 'positive-cashflow',
        title: 'Positive Cash Flow',
        message: 'Congratulations! Your startup is generating positive cash flow.',
        type: 'success',
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        link: '/',
      });
    }

  } catch {
    // If no financial data, show onboarding notification
    notifications.push({
      id: 'welcome',
      title: 'Welcome to Strata AI',
      message: 'Get started by importing your financial data in Settings.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/settings',
    });
  }
  
  // Check for scenarios
  try {
    const scenarios = await apiClient.get<{ scenarios: unknown[] }>('/scenarios');
    if (scenarios.scenarios && scenarios.scenarios.length > 0) {
      notifications.push({
        id: 'scenarios-available',
        title: 'Scenarios Ready',
        message: `You have ${scenarios.scenarios.length} scenario(s) to review.`,
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        link: '/scenarios',
      });
    }
  } catch {
    // Scenarios endpoint not available, skip
  }
  
  // Sort by createdAt (newest first)
  return notifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Mark notification as read
export const markNotificationAsRead = async (id: string): Promise<void> => {
  const store = useNotificationStore.getState();
  
  try {
    // Try to update on server
    await apiClient.put(`/notifications/${id}/read`, {});
  } catch {
    // API doesn't exist, just update locally
  }
  
  store.markAsRead(id);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  const store = useNotificationStore.getState();
  
  try {
    // Try to update on server
    await apiClient.put('/notifications/read-all', {});
  } catch {
    // API doesn't exist, just update locally
  }
  
  store.markAllAsRead();
};

// Format time ago
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};
