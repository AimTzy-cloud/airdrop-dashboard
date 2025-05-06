'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, RefreshCw, Trash2, Check, MessageSquare, Trophy, Settings, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNotificationStore } from '@/lib/notification-service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Notification } from '@/lib/notification-service';

export function NotificationList() {
  const { toast } = useToast();
  const { notifications, fetchNotifications, markAsRead, deleteNotification, markAllAsRead, deleteAllNotifications } =
    useNotificationStore();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const userId = '680da163a8035b63ddd8b200'; // Ganti dengan auth context nanti

  // Filter notifications by type based on active tab
  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (activeTab === 'all') return true;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read && n.userId === userId).length;

  const loadNotifications = async () => {
    setIsLoading(true);
    console.log(`NotificationList fetching notifications for userId: ${userId}`);
    try {
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications. Please try again.',
        variant: 'destructive',
      });
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
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    } finally {
      setMarkingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteNotification(id);
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllAsRead(userId);
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await deleteAllNotifications(userId);
      setShowDeleteAllDialog(false);
      toast({
        title: 'Success',
        description: 'All notifications deleted',
      });
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete all notifications',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-400" />;
      case 'quest':
        return <Trophy className="h-5 w-5 text-purple-400" />;
      case 'system':
        return <Settings className="h-5 w-5 text-blue-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-[#1a1f2e] border-gray-700 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-xl text-white">Notifications</CardTitle>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full"
              >
                {unreadCount} unread
              </motion.span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
              onClick={loadNotifications}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
              Refresh
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1f2e] border-gray-700 text-white">
                <DropdownMenuItem
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0 || isMarkingAll}
                  className="cursor-pointer"
                >
                  {isMarkingAll ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteAllDialog(true)}
                  disabled={notifications.length === 0}
                  className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription className="text-gray-400">View and manage your notifications</CardDescription>
      </CardHeader>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
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

        <CardContent className="pt-6">
          {isLoading && filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              >
                <RefreshCw className="h-12 w-12 opacity-50" />
              </motion.div>
              <p className="mt-4 text-lg">Loading notifications...</p>
              <motion.div
                className="w-48 h-1 bg-gray-800 rounded-full mt-4 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Bell className="h-16 w-16 opacity-30 mb-4" />
              <p className="text-lg mb-2">No notifications</p>
              <p className="text-sm text-gray-500">
                You don&apos;t have any {activeTab !== 'all' ? activeTab : ''} notifications yet
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-4">
                {filteredNotifications.map((notification: Notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'p-4 rounded-lg border relative overflow-hidden group transition-all',
                      notification.read ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-800/60 border-gray-600',
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

                    <div className="flex">
                      <div className="mr-4 mt-1">{getNotificationIcon(notification.type)}</div>

                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full mr-2',
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
                        <h4 className="text-base font-medium text-white mb-1">{notification.title}</h4>
                        <p className="text-sm text-gray-400">{notification.message}</p>

                        <div className="flex justify-end mt-3 space-x-2">
                          {!notification.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markingId === notification.id}
                            >
                              {markingId === notification.id ? (
                                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3 mr-2" />
                              )}
                              Mark as read
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                            onClick={() => handleDelete(notification.id)}
                            disabled={deletingId === notification.id}
                          >
                            {deletingId === notification.id ? (
                              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3 mr-2" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Tabs>

      <CardFooter className="border-t border-gray-700 flex justify-between pt-4">
        <div className="text-sm text-gray-400">
          {filteredNotifications.length} {activeTab !== 'all' ? activeTab : ''} notification
          {filteredNotifications.length !== 1 ? 's' : ''}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isMarkingAll}
          >
            {isMarkingAll ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Mark all as read
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => setShowDeleteAllDialog(true)}
            disabled={filteredNotifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete all
          </Button>
        </div>
      </CardFooter>

      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent className="bg-[#1a1f2e] border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all notifications?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete all your notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAll();
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete all
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}