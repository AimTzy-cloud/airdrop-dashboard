import { connectToDatabase } from '@/lib/db';
import QuestModel from '@/lib/models/quests';
import QuestCompletionModel from '@/lib/models/questsCompletion';
import { User as UserModel } from '@/lib/models/user'; // Alias untuk model Mongoose
import type { QuestCreateInput, QuestUpdateInput, QuestCompletionInput, Quest, QuestCompletion, User as UserType } from '@/lib/types';
import type { IUser } from '@/lib/models/user'; // Impor tipe IUser untuk query
import { Types } from 'mongoose';

// Helper function to safely convert Mongoose document to plain object
function convertDocument<T>(doc: unknown): T {
  if (!doc) return null as unknown as T;

  // If it's an array, map over each item
  if (Array.isArray(doc)) {
    return doc.map((item) => {
      const id = item._id ? item._id.toString() : '';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, __v, ...rest } = item;
      return { id, ...rest };
    }) as unknown as T;
  }

  // Single document
  const docObj = doc as Record<string, unknown>;
  const id = docObj._id ? (docObj._id as Types.ObjectId).toString() : '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, __v, ...rest } = docObj;
  return { id, ...rest } as T;
}

// Quest operations
export async function getAllQuests(): Promise<Quest[]> {
  try {
    await connectToDatabase();
    const quests = await QuestModel.find({}).sort({ createdAt: -1 }).lean();

    // If no quests found, return an empty array immediately
    if (!quests || quests.length === 0) {
      console.log('No quests found in database');
      return [];
    }

    return convertDocument<Quest[]>(quests);
  } catch (error) {
    console.error('Error fetching quests:', error);
    return [];
  }
}

export async function getQuestById(id: string): Promise<Quest | null> {
  try {
    await connectToDatabase();
    const quest = await QuestModel.findById(id).lean();
    if (!quest) return null;
    return convertDocument<Quest>(quest);
  } catch (error) {
    console.error('Error fetching quest by ID:', error);
    throw error;
  }
}

export async function createQuest(questData: QuestCreateInput & { createdBy: string }): Promise<Quest> {
  try {
    await connectToDatabase();
    const newQuest = new QuestModel(questData);
    await newQuest.save();
    const savedQuest = newQuest.toObject();
    return convertDocument<Quest>(savedQuest);
  } catch (error) {
    console.error('Error creating quest:', error);
    throw error;
  }
}

export async function updateQuest(questData: QuestUpdateInput): Promise<Quest> {
  try {
    await connectToDatabase();
    const { id, ...updateData } = questData;

    const updatedQuest = await QuestModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedQuest) {
      throw new Error('Quest not found');
    }

    return convertDocument<Quest>(updatedQuest);
  } catch (error) {
    console.error('Error updating quest:', error);
    throw error;
  }
}

export async function deleteQuest(id: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const result = await QuestModel.findByIdAndDelete(id);

    if (!result) {
      throw new Error('Quest not found');
    }

    // Also delete all completions for this quest
    await QuestCompletionModel.deleteMany({ questId: id });

    return true;
  } catch (error) {
    console.error('Error deleting quest:', error);
    throw error;
  }
}

export async function deleteMultipleQuests(ids: string[]): Promise<{ deletedCount: number }> {
  try {
    await connectToDatabase();
    const result = await QuestModel.deleteMany({ _id: { $in: ids } });

    // Also delete all completions for these quests
    await QuestCompletionModel.deleteMany({ questId: { $in: ids } });

    return { deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Error deleting multiple quests:', error);
    throw error;
  }
}

export async function updateQuestsStatus(
  ids: string[],
  status: 'active' | 'inactive'
): Promise<{ updatedCount: number }> {
  try {
    await connectToDatabase();
    const result = await QuestModel.updateMany({ _id: { $in: ids } }, { $set: { status } });

    return { updatedCount: result.modifiedCount };
  } catch (error) {
    console.error('Error updating quests status:', error);
    throw error;
  }
}

// Quest Completion operations
export async function getQuestCompletions(questId: string): Promise<QuestCompletion[]> {
  try {
    await connectToDatabase();
    const completions = await QuestCompletionModel.find({ questId }).lean();
    return convertDocument<QuestCompletion[]>(completions);
  } catch (error) {
    console.error('Error fetching quest completions:', error);
    throw error;
  }
}

export async function getUserQuestCompletions(userId: string): Promise<QuestCompletion[]> {
  try {
    await connectToDatabase();
    const completions = await QuestCompletionModel.find({ userId }).lean();
    return convertDocument<QuestCompletion[]>(completions);
  } catch (error) {
    console.error('Error fetching user quest completions:', error);
    throw error;
  }
}

export async function updateQuestCompletion(
  userId: string,
  username: string,
  data: QuestCompletionInput
): Promise<QuestCompletion> {
  try {
    await connectToDatabase();
    const now = new Date().toISOString();

    // Check if completion already exists
    const existingCompletion = await QuestCompletionModel.findOne({
      questId: data.questId,
      userId,
    }).lean();

    if (existingCompletion) {
      // Update existing completion
      const completion = existingCompletion as { _id: Types.ObjectId | string };
      const docId =
        typeof completion._id === 'object' ? completion._id : new Types.ObjectId(completion._id.toString());

      const updatedCompletion = await QuestCompletionModel.findByIdAndUpdate(
        docId,
        {
          $set: {
            completed: data.completed,
            completedAt: data.completed ? now : null,
          },
        },
        { new: true }
      ).lean();

      if (!updatedCompletion) {
        throw new Error('Failed to update quest completion');
      }

      // Update quest statistics after updating completion
      await updateQuestStatistics(data.questId);

      return convertDocument<QuestCompletion>(updatedCompletion);
    } else {
      // Create new completion
      const newCompletion = new QuestCompletionModel({
        questId: data.questId,
        userId,
        username,
        completed: data.completed,
        completedAt: data.completed ? now : null,
      });

      await newCompletion.save();
      const savedCompletion = newCompletion.toObject();

      // Update quest statistics after creating completion
      await updateQuestStatistics(data.questId);

      return convertDocument<QuestCompletion>(savedCompletion);
    }
  } catch (error) {
    console.error('Error updating quest completion:', error);
    throw error;
  }
}

export async function updateQuestStatistics(
  questId: string
): Promise<{ participants: number; completionRate: number }> {
  try {
    await connectToDatabase();

    // Get all completions for this quest
    const completions = await QuestCompletionModel.find({ questId }).lean();

    // Count unique users who have interacted with this quest
    const participants = completions.length;

    // Count completions where completed is true
    const completedCount = completions.filter((c: Record<string, unknown>) => c.completed).length;

    // Calculate completion rate
    const completionRate = participants > 0 ? Math.round((completedCount / participants) * 100) : 0;

    // Update quest statistics
    await QuestModel.findByIdAndUpdate(questId, {
      $set: {
        participants,
        completionRate,
      },
    });

    return { participants, completionRate };
  } catch (error) {
    console.error('Error updating quest statistics:', error);
    throw error;
  }
}

// User operations
export async function getUserById(id: string): Promise<UserType | null> {
  try {
    await connectToDatabase();

    // Cari pengguna dengan Mongoose
    const user = await UserModel.findOne({
      $or: [
        { _id: id }, // Langsung cari string ID
        { _id: new Types.ObjectId(id) }, // Coba konversi ke ObjectId
        { id: id },
        { userId: id },
      ],
    }).lean<IUser>();

    if (!user) {
      console.error(`User not found with ID: ${id}`);
      return null;
    }

    // Pastikan settings ada
    if (!user.settings) {
      user.settings = { theme: 'dark', notifications: true, language: 'id' };
    }

    // Konversi ObjectId ke string untuk connections
    if (user.connections && Array.isArray(user.connections)) {
      user.connections = user.connections.map((id) => id.toString());
    }

    return user as UserType;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

export async function updateUserProfile(id: string, profileData: Partial<UserType>) {
  try {
    await connectToDatabase();

    const updateResult = await UserModel.updateOne(
      {
        $or: [
          { _id: id },
          { _id: new Types.ObjectId(id) },
          { id: id },
          { userId: id },
        ],
      },
      {
        $set: {
          ...profileData,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      throw new Error(`User not found with ID: ${id}`);
    }

    return updateResult;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function updateUserPassword(id: string, hashedPassword: string) {
  try {
    await connectToDatabase();

    const updateResult = await UserModel.updateOne(
      {
        $or: [
          { _id: id },
          { _id: new Types.ObjectId(id) },
          { id: id },
          { userId: id },
        ],
      },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      throw new Error(`User not found with ID: ${id}`);
    }

    return updateResult;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
}

export async function updateUserSettings(id: string, settings: UserType['settings']) {
  try {
    await connectToDatabase();

    const updateResult = await UserModel.updateOne(
      {
        $or: [
          { _id: id },
          { _id: new Types.ObjectId(id) },
          { id: id },
          { userId: id },
        ],
      },
      {
        $set: {
          settings,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      throw new Error(`User not found with ID: ${id}`);
    }

    return updateResult;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
}