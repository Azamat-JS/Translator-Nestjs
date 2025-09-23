import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  addChat,
  readChat,
  getChat,
  getChats,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/", verifyToken, getChats);
router.post("/", verifyToken, addChat);
router.get("/:id", verifyToken, getChat);
router.post("/read/:id", verifyToken, readChat);

export default router;
