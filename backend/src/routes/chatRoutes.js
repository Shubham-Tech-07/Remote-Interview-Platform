import express from "express";
import { getStreamToken } from "../controllers/chatController.js";

const router = express.Router();

// Simple endpoint, Clerk middleware auth details provide karega
router.get("/token", getStreamToken);

export default router;