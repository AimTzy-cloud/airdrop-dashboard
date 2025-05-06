import { type NextRequest, NextResponse } from 'next/server';
import { getSessionAppRouter } from '@/lib/auth-utils-app';
import { updateUserPassword } from '@/lib/db-utils';
import { User, IUser } from '@/lib/models/user'; // Impor model dan interface
import { connectToDatabase } from '@/lib/db';
import { compare, hash } from 'bcrypt';
import { Types } from 'mongoose';

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSessionAppRouter();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is updating their own password
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
        { message: 'Forbidden: You can only update your own password' },
        { status: 403 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate the data
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get the user from the database using Mongoose
    const user = await User.findOne({
      $or: [
        { _id: params.userId },
        { _id: new Types.ObjectId(params.userId) },
        { id: params.userId },
        { userId: params.userId },
      ],
    }).lean<IUser>();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user password
    await updateUserPassword(params.userId, hashedPassword);

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Failed to update password' },
      { status: 500 }
    );
  }
}