import express from "express";
import { store, getAllCategories } from "../controllers/categoryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/addCategory", protect, store);
router.get("/getCategories", protect, getAllCategories);

export default router;
