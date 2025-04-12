import multer from "multer";
import path from "path";
import fs from "fs"; // For file system operations (to delete old images)
import Category from "../models/categoryModel.js";
import dotenv from "dotenv";
import NodeCache from "node-cache";

dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/categories"); // Save images in the "uploads/categories" folder
  },
  filename: (req, file, cb) => {
    cb(null, "Category" + Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage }).single("category_image");
const cache = new NodeCache({ stdTTL: 1, checkperiod: 1 });
cache.flushAll(); // Immediately remove all entries

// Create a new category
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
        category_status: category_status || 1,
      });

      // Clear cache after creating a new category
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

// Get all active categories (status = 1)
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



// Update a category
export const update = async (req, res) => {
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

      const { id } = req.params;
      const { category_name, category_status } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      // If a new file is uploaded, delete the old image (if it exists)
      if (req.file && category.category_image) {
        const oldImagePath = path.join(
          "uploads/categories",
          category.category_image
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete old image
        }
      }

      // Update category details
      category.category_name = category_name || category.category_name;
      category.category_image = req.file
        ? req.file.filename
        : category.category_image;
      category.category_status =
        category_status !== undefined
          ? category_status
          : category.category_status;

      await category.save();

      // Clear cache after updating
      cache.del("categories");

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  });
};

// Soft delete a category (set status to 0)
export const destroy = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Soft delete by setting status to 0
    category.category_status = 0;
    await category.save();

    // Clear cache after deleting
    cache.del("categories");

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};