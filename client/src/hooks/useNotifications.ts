import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

export interface CivicNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<CivicNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch(`/notifications/${user.id}`);
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n: CivicNotification) => !n.isRead).length);
      } else {
        console.error("Format date notificări invalid:", data);
      }
    } catch (error) {
      console.error("Eroare la preluarea notificărilor:", error);
    }
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Eroare la marcarea notificării ca citită:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { notifications, unreadCount, markAsRead, refresh: fetchNotifications };
}