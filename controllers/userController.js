import User from "../models/userModel.js";
import path from "path";
import multer from "multer";
import fs from "fs";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/user_images/"); // Save files in 'uploads/user_images/'
  },
  filename: (req, file, cb) => {
    cb(null, `User${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and JPG files are allowed"), false);
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
}).single("user_image"); // Accepts only one file with key 'user_image'

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
    const baseUrl = process.env.BASE_URL || "http://localhost:5000"; // Update with your actual domain
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
// Create or update channel
export const storeChannel = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      const { channel_name, channel_description, channel_media_links } =
        req.body;

      if (!channel_name) {
        return res
          .status(400)
          .json({ success: false, message: "Channel name is required" });
      }

      // Find existing user
      const user = await User.findOne({ where: { id: req.user.userId } });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let imageUrl = user.user_image; // Keep the old image if no new one is uploaded

      if (req.file) {
        // Delete the old image if it exists
        if (user.user_image) {
          const oldImagePath = user.user_image.replace(
            `${req.protocol}://${req.get("host")}/`,
            ""
          );
          const filePath = path.join(process.cwd(), oldImagePath);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        // Set new image URL
        const user_image = req.file.path.replace(/\\/g, "/");
        imageUrl = `${req.protocol}://${req.get("host")}/${user_image}`;
      }

      // Update user record with new details
      await User.update(
        {
          channel_name,
          channel_description,
          channel_media_links,
          user_image: imageUrl, // Save new or old image
        },
        {
          where: { id: req.user.userId },
        }
      );

      res.json({
        success: true,
        message: "Channel updated successfully",
        data: {
          channel_name,
          channel_description,
          channel_media_links,
          user_image: imageUrl,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
