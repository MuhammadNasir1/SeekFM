import express from "express";
import { getUser, storeChannel } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getUser", protect, getUser);
router.post("/createChannel", protect, storeChannel);

export default router;
