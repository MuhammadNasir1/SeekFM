import multer from "multer";
import path from "path";
import Category from "../models/categoryModel.js";
import dotenv from "dotenv";
import NodeCache from "node-cache";
dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/categories"); // Save images in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, "Category" + Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage }).single("category_image");
const cache = new NodeCache({ stdTTL: 60 * 5 }); // Cache for 5 minutes
export const store = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "File upload error", err });
    }

    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { category_name, category_status } = req.body;
      if (!category_name) {
        return res
          .status(400)
          .json({ success: false, message: "Category name is required" });
      }

      // If file is uploaded, get the filename
      const category_image = req.file ? req.file.filename : null;

      const category = await Category.create({  
        category_name,
        category_image,
        category_status: category_status || 1, // Default to 1 if not provided
      });
      cache.del("categories");
      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  });
};

export const getAllCategories = async (req, res) => {
  try {
    // Check if data exists in cache
    const cachedCategories = cache.get("categories");
    if (cachedCategories) {
      return res.status(200).json({
        success: true,
        message: "Categories retrieved from cache",
        data: cachedCategories,
      });
    }

    // Fetch from database where category_status = 1
    const categories = await Category.findAll({
      where: { category_status: 1 },
    });

    // Format categories (image path)
    const formattedCategories = categories.map((category) => ({
      category_id: category.category_id,
      category_name: category.category_name,
      category_image: category.category_image
        ? `${BASE_URL}/uploads/categories/${category.category_image}`
        : null,
      category_status: category.category_status,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    // Store result in cache
    cache.set("categories", formattedCategories);

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: formattedCategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
