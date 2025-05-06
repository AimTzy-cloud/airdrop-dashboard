import { getSessionAppRouter } from '@/lib/auth-utils-app';
import { redirect } from 'next/navigation';
import { UserSettingsForm } from '@/components/user-settings-form';
import { getUserById } from '@/lib/db-utils';
import Image from 'next/image'; // Impor Image dari next/image

export default async function SettingsPage() {
  const session = await getSessionAppRouter();

  if (!session) {
    redirect('/login');
  }

  // Ambil userId langsung dari session
  const userId = session.userId;

  if (!userId) {
    throw new Error('User ID tidak ditemukan di session');
  }

  // Ambil data pengguna dari database
  const userData = await getUserById(userId);

  if (!userData) {
    throw new Error('Pengguna tidak ditemukan');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-5 sticky top-24">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-blue-500/30 p-1">
                <Image
                  src={userData.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`}
                  alt={userData.username}
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-medium text-white">{userData.username}</h3>
              <p className="text-sm text-gray-400 capitalize">{userData.role || 'member'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Member since</span>
                <span className="text-gray-300">
                  {new Date(userData.joinedDate || userData.createdAt || new Date()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last active</span>
                <span className="text-gray-300">
                  {new Date(userData.lastActive || userData.updatedAt || new Date()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <div className="flex items-center">
                  <span
                    className={`h-2 w-2 rounded-full mr-1.5 ${
                      userData.status === 'online'
                        ? 'bg-green-500'
                        : userData.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-gray-300 capitalize">{userData.status || 'offline'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <UserSettingsForm userData={userData} />
        </div>
      </div>
    </div>
  );
}