import express from "express";
import { store, getMedia } from "../controllers/mediaController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/createMedia", protect, store);
router.get("/getMedia", protect, getMedia);

export default router;
