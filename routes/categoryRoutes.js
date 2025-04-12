import express from "express";
import { store, getAllCategories , update  , destroy} from "../controllers/categoryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/addCategory", protect, store);
router.get("/getCategories", protect, getAllCategories);
router.put("/updateCategory/:id", protect, update);
router.post("/deleteCategory/:id", protect, destroy);

export default router;
