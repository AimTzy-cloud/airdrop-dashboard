'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/lib/notification-service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/notification-service';

interface NotificationPanelProps {
  onClose?: () => void;
  onViewAll?: () => void;
  userId: string; // Hapus default user123
}

export function NotificationPanel({ onClose, onViewAll, userId }: NotificationPanelProps) {
  const { notifications, fetchNotifications, markAsRead, deleteNotification, markAllAsRead } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  // Filter notifications by userId
  const userNotifications = notifications.filter((n: Notification) => n.userId === userId);

  // Filter notifications by type based on active tab
  const filteredNotifications = userNotifications.filter((notification: Notification) => {
    if (activeTab === 'all') return true;
    return notification.type === activeTab;
  });

  const unreadCount = userNotifications.filter((n: Notification) => !n.read).length;

  const loadNotifications = async () => {
    setIsLoading(true);
    console.log(`NotificationPanel fetching notifications for userId: ${userId}`);
    try {
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Hanya fetch sekali, tanpa polling
  }, [userId]);

  const handleMarkAsRead = async (id: string) => {
    setMarkingId(id);
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setMarkingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userId);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-[350px] bg-[#1a1f2e] border border-gray-700 rounded-lg shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2 text-blue-400" />
          <h3 className="font-medium text-white">Notifications</h3>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full"
            >
              {unreadCount}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={loadNotifications}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 pt-2">
          <TabsList className="w-full bg-gray-800/50">
            <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-blue-600/20">
              All
            </TabsTrigger>
            <TabsTrigger value="message" className="flex-1 data-[state=active]:bg-blue-600/20">
              Messages
            </TabsTrigger>
            <TabsTrigger value="quest" className="flex-1 data-[state=active]:bg-blue-600/20">
              Quests
            </TabsTrigger>
            <TabsTrigger value="system" className="flex-1 data-[state=active]:bg-blue-600/20">
              System
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <ScrollArea className="h-[300px] px-4">
            {isLoading && filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                >
                  <RefreshCw className="h-8 w-8 opacity-50" />
                </motion.div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
                <Bell className="h-8 w-8 opacity-50 mb-2" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredNotifications.map((notification: Notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'mb-2 p-3 rounded-lg border border-gray-700 relative overflow-hidden group',
                      notification.read ? 'bg-gray-800/30' : 'bg-gray-800/60',
                    )}
                  >
                    {!notification.read && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    <div className="flex justify-between">
                      <div className="flex-1 pr-6">
                        <div className="flex items-center mb-1">
                          <span
                            className={cn(
                              'text-xs font-medium px-1.5 py-0.5 rounded-full mr-2',
                              notification.type === 'message' && 'bg-green-500/20 text-green-300',
                              notification.type === 'quest' && 'bg-purple-500/20 text-purple-300',
                              notification.type === 'system' && 'bg-blue-500/20 text-blue-300',
                            )}
                          >
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-white mb-1">{notification.title}</p>
                        <p className="text-xs text-gray-400">{notification.message}</p>
                      </div>

                      <div className="absolute right-2 top-2 flex gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markingId === notification.id}
                          >
                            {markingId === notification.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </motion.div>
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(notification.id)}
                          disabled={deletingId === notification.id}
                        >
                          {deletingId === notification.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </motion.div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-3 border-t border-gray-700 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-gray-400 hover:text-white"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
          onClick={onViewAll}
        >
          View all
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}