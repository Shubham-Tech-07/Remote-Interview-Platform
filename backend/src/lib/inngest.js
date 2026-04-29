import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "nex-hire" });

export const syncUser = inngest.createFunction(
  {
    id: "sync-user",
    name: "Sync User",
    triggers: [{ event: "clerk/user.created" }, { event: "clerk/user.updated" }] // Updated event bhi add kar diya
  },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const userData = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url,
    };

    // ✅ FIX: create ki jagah findOneAndUpdate use karein (Upsert)
    // Isse duplicate user ka error nahi aayega
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      userData,
      { upsert: true, new: true }
    );

    // Stream user ko sync karein
    await upsertStreamUser({
      id: user.clerkId.toString(),
      name: user.name,
      image: user.profileImage,
    });

    console.log(`User ${user.name} synced successfully!`);
  }
);

export const deleteUserFromDB = inngest.createFunction(
  {
    id: "delete-user-from-db",
    name: "Delete User",
    triggers: [{ event: "clerk/user.deleted" }]
  },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.deleteOne({ clerkId: id });
    await deleteStreamUser(id.toString());
    console.log(`User ${id} deleted successfully!`);
  }
);

export const functions = [syncUser, deleteUserFromDB];