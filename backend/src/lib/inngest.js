import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "talent-iq" });

// ✅ FIX: Triggers ko 1st argument ke andar rakha hai aur handler ko 2nd argument.
export const syncUser = inngest.createFunction(
  {
    id: "sync-user",
    name: "Sync User",
    triggers: [{ event: "clerk/user.created" }] // Trigger ab yahan hai
  },
  async ({ event }) => { // Handler ab seedha 2nd argument hai
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

// ✅ FIX: Same yahan bhi structure update kiya hai
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
  }
);

export const functions = [syncUser, deleteUserFromDB];