import express from "express";
import { getUser, storeChannel , updateChannel } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getUser", protect, getUser);
router.post("/createChannel", protect, storeChannel);
router.post("/updateChannel", protect, updateChannel);

export default router;
