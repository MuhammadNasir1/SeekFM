import User from "../models/userModel.js";
import path from "path";
import multer from "multer";
import fs from "fs";
import Category from "../models/categoryModel.js";
import { Op } from "sequelize";
import Media from "../models/mediaModel.js";

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/user_images/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `User${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize multer without type and size restrictions
const upload = multer({
  storage,
}).single("user_image");

// Upload timeout middleware
const uploadTimeout = (req, res, next) => {
  const timeoutDuration = 30000; // 30 seconds timeout
  req.setTimeout(timeoutDuration, () => {
    return res.status(408).json({
      success: false,
      message: "Image upload timed out",
    });
  });
  next();
};

// Get User
export const getUser = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Remove password from response
    const {
      password: _,
      user_image,
      channel_media_links,
      ...userWithoutPassword
    } = user.get({ plain: true });

    // Construct full URL for user_image
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const userImageUrl = user_image ? `${baseUrl}/${user_image}` : null;

    // Parse media links if stored as a JSON string
    let parsedMediaLinks = [];
    try {
      parsedMediaLinks = channel_media_links
        ? JSON.parse(channel_media_links)
        : [];
    } catch (error) {
      console.error("Error parsing media links:", error);
    }

    res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        user_image: userImageUrl,
        channel_media_links: parsedMediaLinks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Create channel
export const storeChannel = async (req, res) => {
  try {
    // Authentication check
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Apply upload timeout
    await new Promise((resolve, reject) => {
      uploadTimeout(req, res, () => {
        upload(req, res, (err) => {
          if (err instanceof multer.MulterError) {
            return reject(new Error(`Upload error: ${err.message}`));
          } else if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });

    const { channel_name, channel_description, channel_media_links } = req.body;

    // Validate required fields
    if (!channel_name) {
      return res.status(400).json({
        success: false,
        message: "Channel name is required",
      });
    }

    // Find existing user
    const user = await User.findOne({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let imagePath = user.user_image;

    // Handle new image upload
    if (req.file) {
      // Delete old image if it exists
      if (user.user_image) {
        try {
          const oldImagePath = path.join(process.cwd(), user.user_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
        }
      }

      imagePath = req.file.path.replace(/\\/g, "/");
    }

    // Update user record
    const updatedData = {
      channel_name,
      channel_description: channel_description || null,
      channel_media_links: channel_media_links || null,
      user_image: imagePath,
    };

    await User.update(updatedData, {
      where: { id: req.user.userId },
    });

    const responseImage = imagePath
      ? `${req.protocol}://${req.get("host")}/${imagePath}`
      : null;

    res.status(200).json({
      success: true,
      message: "Channel updated successfully",
      data: {
        channel_name,
        channel_description: updatedData.channel_description,
        channel_media_links: updatedData.channel_media_links,
        user_image: responseImage,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update channel
export const updateChannel = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await new Promise((resolve, reject) => {
      uploadTimeout(req, res, () => {
        upload(req, res, (err) => {
          if (err instanceof multer.MulterError) {
            return reject(new Error(`Upload error: ${err.message}`));
          } else if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });

    const { channel_name, channel_description, channel_media_links } = req.body;

    if (!channel_name) {
      return res.status(400).json({
        success: false,
        message: "Channel name is required",
      });
    }

    const user = await User.findOne({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let imagePath = user.user_image;

    if (req.file) {
      try {
        if (user.user_image) {
          const oldImagePath = path.join(process.cwd(), user.user_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      } catch (deleteError) {
        console.error("Error deleting old image:", deleteError);
      }

      imagePath = req.file.path.replace(/\\/g, "/");
    }

    const updatedData = {
      channel_name,
      channel_description: channel_description || null,
      channel_media_links: channel_media_links || null,
      user_image: imagePath,
    };

    await User.update(updatedData, {
      where: { id: req.user.userId },
    });

    const responseImage = imagePath
      ? `${req.protocol}://${req.get("host")}/${imagePath}`
      : null;

    res.status(200).json({
      success: true,
      message: "Channel updated successfully",
      data: {
        channel_name,
        channel_description: updatedData.channel_description,
        channel_media_links: updatedData.channel_media_links,
        user_image: responseImage,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update profile
export const updateUser = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await new Promise((resolve, reject) => {
      uploadTimeout(req, res, () => {
        upload(req, res, (err) => {
          if (err instanceof multer.MulterError) {
            return reject(new Error(`Upload error: ${err.message}`));
          } else if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });

    const { name, phone, gender, about } = req.body;

    const user = await User.findOne({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let imagePath = user.user_image;

    if (req.file) {
      try {
        if (user.user_image) {
          const oldImagePath = path.join(process.cwd(), user.user_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      } catch (deleteError) {
        console.error("Error deleting old image:", deleteError);
      }

      imagePath = req.file.path.replace(/\\/g, "/");
    }

    const updatedData = {
      name,
      phone,
      gender,
      about: about || null,
      user_image: imagePath,
    };

    await User.update(updatedData, {
      where: { id: req.user.userId },
    });

    const responseImage = imagePath
      ? `${req.protocol}://${req.get("host")}/${imagePath}`
      : null;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        name,
        phone: updatedData.phone,
        gender: updatedData.gender,
        about: updatedData.about,
        user_image: responseImage,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userCount = await User.count({ where: { user_role: "appUser" } });
    const creatorCount = await User.count({
      where: { channel_name: { [Op.ne]: null, [Op.ne]: "" } },
    });
    const categoryCount = await Category.count({
      where: { category_status: { [Op.ne]: 0 } },
    });
    const audioCount = await Media.count();
    res.status(200).json({
      success: true,
      message: "Dashboard Data get successfully",
      data: {
        userCount,
        creatorCount,
        audioCount,
        categoryCount,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
export const getAppUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const appUsers = await User.findAll({
      where: { user_role: "appUser" },
      attributes: { exclude: ["password"] }, // exclude password
    });

    // Construct full URLs for user images and parse media links
    const baseUrl = process.env.BASE_URL || "";
    const usersWithFormattedData = appUsers.map((user) => {
      const plainUser = user.get({ plain: true });

      let parsedMediaLinks = [];
      try {
        parsedMediaLinks = plainUser.channel_media_links
          ? JSON.parse(plainUser.channel_media_links)
          : [];
      } catch (error) {
        console.error(
          `Error parsing media links for user ${plainUser.id}:`,
          error
        );
      }

      return {
        ...plainUser,
        user_image: plainUser.user_image
          ? `${baseUrl}/${plainUser.user_image}`
          : null,
        channel_media_links: parsedMediaLinks,
      };
    });

    res.json({
      success: true,
      users: usersWithFormattedData,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
