import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "talent-iq" });

// ✅ FIXED: Config aur Event trigger ab ek hi object mein hain
const syncUser = inngest.createFunction(
  {
    id: "sync-user",
    name: "Sync User to DB" // optional but good practice
  },
  { event: "clerk/user.created" }, // Ye wahi rahega
  async ({ event, step }) => {    // Handler ab third nahi, second argument hona chahiye agar trigger alag hai
    // Lekin v3 mein best way ye hai:
    // createFunction({ id, name }, { event }, handler)

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

// ✅ FIXED: Same yahan bhi structure update kiya hai
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

export const functions = [syncUser, deleteUserFromDB];