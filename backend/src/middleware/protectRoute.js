import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      // Clerk se userId nikaalo (Note: req.auth ab ek object hai function nahi)
      const clerkId = req.auth.userId;

      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized - No userId found" });
      }

      // DB mein user dhoondo
      let user = await User.findOne({ clerkId });

      // AGAR USER NAHI MILA: 404 bhejne ke bajaye hum check karte hain
      if (!user) {
        console.log("User not found in DB for clerkId:", clerkId);
        // Yahan aap error bhejne ke bajaye handle kar sakte hain
        return res.status(404).json({ message: "User not found in database. Please re-login or check webhooks." });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];