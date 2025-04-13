import express from "express";
import {
  getUser,
  storeChannel,
  updateChannel,
  updateUser,
  getDashboardData,
  getAppUsers,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getUser", protect, getUser);
router.get("/getAppUsers", protect, getAppUsers);
router.post("/updateUser", protect, updateUser);
router.post("/createChannel", protect, storeChannel);
router.post("/updateChannel", protect, updateChannel);
router.get("/dashboardData", protect, getDashboardData);

export default router;
