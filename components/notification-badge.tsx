'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/lib/notification-service';
import type { Notification } from '@/lib/notification-service';

interface NotificationBadgeProps {
  onClick?: () => void;
  userId: string; // Hapus default user123
}

export function NotificationBadge({ onClick, userId }: NotificationBadgeProps) {
  const { notifications, fetchNotifications } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Count unread notifications
  const unreadCount = notifications.filter((n: Notification) => !n.read && n.userId === userId).length;

  useEffect(() => {
    const loadNotifications = async () => {
      if (isLoading) return; // Cegah fetch ganda
      setIsLoading(true);
      console.log(`NotificationBadge fetching notifications for userId: ${userId}`);
      try {
        await fetchNotifications(userId);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Polling setiap 30 detik
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, userId]);

  useEffect(() => {
    if (unreadCount > 0 && !hasAnimated) {
      setHasAnimated(true);
    } else if (unreadCount === 0) {
      setHasAnimated(false);
    }
  }, [unreadCount, hasAnimated]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-400 hover:text-white relative"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
        >
          <Bell className="h-5 w-5 opacity-70" />
        </motion.div>
      ) : (
        <Bell className="h-5 w-5" />
      )}

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: 1,
              transition: {
                scale: { repeat: hasAnimated ? 0 : 3, duration: 0.3 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1 right-1 flex items-center justify-center"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}