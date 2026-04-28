import { StreamChat } from "stream-chat";

export const getStreamToken = async (req, res) => {
  try {
    // Clerk middleware req.auth deta hai jisme claims bhi hote hain
    const { userId, sessionClaims } = req.auth || {};

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const serverClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY,
      process.env.STREAM_SECRET_KEY
    );

    // Stream Token generate karein
    const token = serverClient.createToken(userId);

    // Frontend (useStreamClient.js) ko ye 4 cheezein chahiye
    res.status(200).json({
      token,
      userId,
      userName: sessionClaims?.name || "Anonymous User",
      userImage: sessionClaims?.image || "",
    });

  } catch (error) {
    console.error("Stream Token Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};