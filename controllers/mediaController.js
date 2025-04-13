import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import Media from "../models/mediaModel.js";
dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://localhost:5000"; // Change to your actual domain
// Configure multer storage for media files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/media/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `Media${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File filter for images and audio files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPEG, PNG, JPG images and MP3, WAV audio files are allowed"
      ),
      false
    );
  }
};

// Use `.fields()` to specify `banner` and `audio` separately
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).fields([
  { name: "banner", maxCount: 1 },
  { name: "audio", maxCount: 1 },
]);

const cache = new NodeCache({ stdTTL: 60 * 5 }); // Cache for 5 minutes

export const store = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({
        success: false,
        message: "File upload error",
        error: err.message,
      });
    }

    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const {
        title,
        description,
        type,
        category_id,
        duration,
        language,
        tags,
        cast,
        crew,
        release_date,
      } = req.body;
      const userId = req.user.userId;

      // Extract single file paths safely
      // Convert file paths to correct format
      const bannerPath = req.files["banner"]
        ? req.files["banner"][0].path.replace(/\\/g, "/")
        : null;
      const audioPath = req.files["audio"]
        ? req.files["audio"][0].path.replace(/\\/g, "/")
        : null;

      // Create media entry
      const newMedia = await Media.create({
        user_id: userId,
        title,
        description,
        type,
        category_id,
        banner: bannerPath,
        audio: audioPath,
        duration,
        language,
        tags,
        banner: bannerPath,
        audio: audioPath,
        cast,
        crew,
        release_date,
      });

      res.json({
        success: true,
        message: "Media uploaded successfully",
        media: newMedia,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  });
};
export const getMedia = async (req, res) => {
  try {
    const { category_id } = req.query; // Get category filter from query params

    const whereClause = category_id ? { category_id } : {}; // Apply filter if category_id exists

    const mediaItems = await Media.findAll({ where: whereClause });

    const mediaWithBaseUrl = mediaItems.map((media) => ({
      ...media.toJSON(),
      banner: media.banner ? `${BASE_URL}/${media.banner}` : null,
      audio: media.audio ? `${BASE_URL}/${media.audio}` : null,
    }));

    res.json({
      success: true,
      media: mediaWithBaseUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const getUserMedia = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const mediaItems = await Media.findAll({
      where: { user_id: req.user.userId },
    });

    const mediaWithBaseUrl = mediaItems.map((media) => ({
      ...media.toJSON(),
      banner: media.banner ? `${BASE_URL}/${media.banner}` : null,
      audio: media.audio ? `${BASE_URL}/${media.audio}` : null,
    }));

    res.json({
      success: true,
      media: mediaWithBaseUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};