import { type NextRequest, NextResponse } from 'next/server';
import { getSessionAppRouter } from '@/lib/auth-utils-app';
import { updateUserProfile } from '@/lib/db-utils';
import { User, IUser } from '@/lib/models/user';
import { connectToDatabase } from '@/lib/db';
import { Types } from 'mongoose';

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSessionAppRouter();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is updating their own profile or is an admin
    const currentUserId = session.userId;

    // Ambil role dari database
    await connectToDatabase();
    const currentUser = await User.findOne({
      $or: [
        { _id: currentUserId },
        { _id: new Types.ObjectId(currentUserId) },
        { id: currentUserId },
        { userId: currentUserId },
      ],
    }).lean<IUser>();

    if (!currentUser) {
      return NextResponse.json({ message: 'Current user not found' }, { status: 404 });
    }

    const isAdmin = currentUser.role === 'admin';

    if (currentUserId !== params.userId && !isAdmin) {
      return NextResponse.json(
        { message: 'Forbidden: You can only update your own profile' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate the data
    if (data.username === '') {
      return NextResponse.json({ message: 'Username cannot be empty' }, { status: 400 });
    }

    // Update the user profile
    await updateUserProfile(params.userId, data);

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}