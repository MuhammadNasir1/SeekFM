import express from "express";
import { getUser } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getUser", protect , getUser);

export default router;
