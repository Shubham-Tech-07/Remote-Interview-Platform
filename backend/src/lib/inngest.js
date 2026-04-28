import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "talent-iq" });

// ✅ FIXED: Inngest v3 syntax (Id aur Event ko ek hi object mein rakhein ya 3 arguments dein)
const syncUser = inngest.createFunction(
  { id: "sync-user", name: "Sync User" }, // 1st argument: Config (id & name)
  { event: "clerk/user.created" },        // 2nd argument: Trigger
  async ({ event }) => {                  // 3rd argument: Handler function
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      profileImage: image_url,
    };

    await User.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });
  }
);

// ✅ FIXED: Same logic yahan bhi
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db", name: "Delete User" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

export const functions = [syncUser, deleteUserFromDB];