import express from "express";
import { store, getMedia , getUserMedia , updateMediaStatus } from "../controllers/mediaController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/createMedia", protect, store);
router.get("/getMedia", protect, getMedia);
router.get("/getUserMedia", protect, getUserMedia);
router.put("/updateMediaStatus/:id", protect, updateMediaStatus);

export default router;
