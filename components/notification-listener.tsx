'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/lib/notification-service';

interface NotificationListenerProps {
  userId: string;
  username: string;
}

export function NotificationListener({ userId, username }: NotificationListenerProps) {
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Nonaktifkan demo notifications untuk debugging
    console.log(`NotificationListener active for userId: ${userId}, username: ${username}`);
    return () => {};
  }, [userId, username, addNotification]);

  return null;
}