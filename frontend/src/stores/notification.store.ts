import { create } from 'zustand';
import type { Notification } from '@/types/notification.types';

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...(state.notifications || [])],
  })),
  
  markAsRead: (id) => set((state) => ({
    notifications: (state.notifications || []).map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: (state.notifications || []).map((n) => ({ ...n, read: true })),
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: (state.notifications || []).filter((n) => n.id !== id),
  })),
  
  clearAll: () => set({ notifications: [] }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
// ... existing code ...
  
  getUnreadCount: () => {
    const state = get();
  // Safety check: if state or notifications is undefined, return 0
    if (!state || !state.notifications || !Array.isArray(state.notifications)) {
      return 0;
    }
    return state.notifications.filter((n) => !n.read).length;
  },
}));
