import { StreamChat } from "stream-chat";

export const getStreamToken = async (req, res) => {
  try {
    // Clerk middleware req.auth object populate karta hai
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    // TYPO FIXED: STREAM_API_KEY (Aapka APT_KEY tha)
    const serverClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY,
      process.env.STREAM_SECRET_KEY
    );

    const token = serverClient.createToken(userId);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Stream Token Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};