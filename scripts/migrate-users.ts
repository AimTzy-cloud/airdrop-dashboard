import { connectToDatabase } from "../lib/db";
import { User } from "../lib/models/user";
import dotenv from "dotenv";

// Load .env
dotenv.config();

// Fungsi untuk generate avatar default dari DiceBear
const getDefaultAvatar = (username: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;

async function migrateUsers() {
  try {
    console.log("Starting user migration...");
    console.log("Current directory:", process.cwd());
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    await connectToDatabase();

    // Cari user yang nggak punya atribut baru
    const users = await User.find({
      $or: [
        { profilePicture: { $exists: false } },
        { role: { $exists: false } },
        { status: { $exists: false } },
        { connections: { $exists: false } },
        { settings: { $exists: false } },
        { bio: { $exists: false } },
        { lastActive: { $exists: false } },
        { joinedDate: { $exists: false } },
        { email: { $exists: false } },
        { googleId: { $exists: false } },       // Tambahkan googleId
        { hasLinkedGoogle: { $exists: false } } // Tambahkan hasLinkedGoogle
      ],
    });

    console.log(`Found ${users.length} users to migrate`);

    // Update setiap user dengan nilai default
    for (const user of users) {
      user.profilePicture = user.profilePicture || getDefaultAvatar(user.username); // Set avatar default
      user.bio = user.bio || "";
      user.role = user.role || "member";
      user.status = user.status || "offline";
      user.lastActive = user.lastActive || new Date();
      user.connections = user.connections || [];
      user.joinedDate = user.joinedDate || user.createdAt || new Date();
      user.settings = user.settings || {
        theme: "dark",
        notifications: true,
        language: "id",
      };
      user.email = user.email || undefined;
      user.googleId = user.googleId || undefined;       // Set googleId default ke undefined
      user.hasLinkedGoogle = user.hasLinkedGoogle || false; // Set hasLinkedGoogle default ke false

      await user.save();
      console.log(`Migrated user: ${user.username} with avatar: ${user.profilePicture}`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrateUsers();