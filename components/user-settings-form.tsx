'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Upload, X, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

interface UserSettings {
  theme?: string;
  notifications?: boolean;
  language?: string;
  compactView?: boolean;
  emailNotifications?: boolean;
  questNotifications?: boolean;
  messageNotifications?: boolean;
}

interface UserSettingsFormProps {
  userData: {
    _id?: string;
    id?: string;
    userId?: string;
    username: string;
    bio?: string;
    profilePicture?: string;
    role?: string;
    status?: string;
    settings?: UserSettings;
  };
}

export function UserSettingsForm({ userData }: UserSettingsFormProps) {
  const userId = userData._id || userData.id || userData.userId;
  const [username, setUsername] = useState(userData.username || '');
  const [bio, setBio] = useState(userData.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string>(
    userData.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    theme: userData.settings?.theme || 'dark',
    notifications: userData.settings?.notifications !== false,
    language: userData.settings?.language || 'en',
    compactView: userData.settings?.compactView || false,
    emailNotifications: userData.settings?.emailNotifications || false,
    questNotifications: userData.settings?.questNotifications !== false,
    messageNotifications: userData.settings?.messageNotifications !== false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Prepare the profile data
      const profileData = {
        bio,
        ...(previewImage && { profilePicture: previewImage }),
      };

      // Call API to update profile
      const response = await fetch(`/api/users/${userId}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update local state
      if (previewImage) {
        setProfileImage(previewImage);
        setPreviewImage(null);
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        variant: 'default',
      });

      setSuccessMessage('Profile updated successfully');

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: 'New password and confirm password must match',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Call API to update password
      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update password');
      }

      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
        variant: 'default',
      });

      setSuccessMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setIsSubmitting(true);

    try {
      // Call API to update settings
      const response = await fetch(`/api/users/${userId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      toast({
        title: 'Settings updated',
        description: 'Your preferences have been saved',
        variant: 'default',
      });

      // Refresh the page to apply new settings
      router.refresh();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const cancelImageUpload = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraClick = async () => {
    if (navigator.mediaDevices) {
      try {
        // Coba akses kamera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Catatan: Implementasi kamera tidak lengkap di demo ini
        stream.getTracks().forEach((track) => track.stop()); // Hentikan stream
        toast({
          title: 'Camera access',
          description: 'Camera functionality is not fully implemented in this demo',
        });
      } catch {
        toast({
          title: 'Camera not available',
          description: 'Could not access camera. Please check permissions or device support.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Camera not available',
        description: "Your device or browser doesn't support camera access",
        variant: 'destructive',
      });
    }
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-3 bg-[#1a1f2e] border border-gray-700">
        <TabsTrigger value="profile" className="data-[state=active]:bg-gray-800">
          Profile
        </TabsTrigger>
        <TabsTrigger value="security" className="data-[state=active]:bg-gray-800">
          Security
        </TabsTrigger>
        <TabsTrigger value="preferences" className="data-[state=active]:bg-gray-800">
          Preferences
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-4">
        <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-md flex items-center text-green-400">
              <Check className="h-5 w-5 mr-2" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <Label htmlFor="profile-picture">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-blue-500/30">
                      <AvatarImage src={previewImage || profileImage} alt={username} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl">
                        {username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={triggerFileInput}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCameraClick}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Camera
                      </Button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      id="profile-picture"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <p className="text-xs text-gray-400">Supported formats: JPEG, PNG, GIF. Max size: 5MB</p>
                  </div>
                </div>

                {previewImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={cancelImageUpload}
                      className="h-7 px-2"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <span className="text-xs text-blue-400">New profile picture selected</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  disabled={userData.role !== 'admin'}
                />
                {userData.role !== 'admin' && (
                  <p className="text-xs text-gray-500 mt-1">Only administrators can change their username</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  className="bg-gray-800 border-gray-700 min-h-[100px]"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </TabsContent>

      <TabsContent value="security" className="mt-4">
        <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-md flex items-center text-green-400">
              <Check className="h-5 w-5 mr-2" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </TabsContent>

      <TabsContent value="preferences" className="mt-4">
        <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Notification Settings</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Enable Notifications</h4>
                <p className="text-xs text-gray-400 mt-1">Receive notifications for messages and quests</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Message Notifications</h4>
                <p className="text-xs text-gray-400 mt-1">Get notified when you receive new messages</p>
              </div>
              <Switch
                checked={settings.messageNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, messageNotifications: checked })}
                disabled={!settings.notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Quest Notifications</h4>
                <p className="text-xs text-gray-400 mt-1">Get notified when new quests are available</p>
              </div>
              <Switch
                checked={settings.questNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, questNotifications: checked })}
                disabled={!settings.notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Email Notifications</h4>
                <p className="text-xs text-gray-400 mt-1">Receive email notifications for important updates</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                disabled={!settings.notifications}
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Display Settings</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">Dark Mode</h4>
                  <p className="text-xs text-gray-400 mt-1">Always use dark mode</p>
                </div>
                <Switch
                  checked={settings.theme === 'dark'}
                  onCheckedChange={(checked) => setSettings({ ...settings, theme: checked ? 'dark' : 'light' })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">Compact View</h4>
                  <p className="text-xs text-gray-400 mt-1">Use compact view for lists and tables</p>
                </div>
                <Switch
                  checked={settings.compactView}
                  onCheckedChange={(checked) => setSettings({ ...settings, compactView: checked })}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <Button onClick={handleSettingsUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}