import { type NextRequest, NextResponse } from 'next/server';
import { getSessionAppRouter } from '@/lib/auth-utils-app';
import { updateUserSettings } from '@/lib/db-utils';

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSessionAppRouter();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is updating their own settings
    const currentUserId = session.userId;
    const isAdmin = session.role === 'admin';

    if (currentUserId !== params.userId && !isAdmin) {
      return NextResponse.json(
        { message: 'Forbidden: You can only update your own settings' },
        { status: 403 }
      );
    }

    const settings = await request.json();

    // Update the user settings
    await updateUserSettings(params.userId, settings);

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}