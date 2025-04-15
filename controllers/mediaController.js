import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import Media from "../models/mediaModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
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
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/jpg",
//     "audio/mpeg",
//     "audio/wav",
//     "audio/mp3",
//   ];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Only JPEG, PNG, JPG images and MP3, WAV audio files are allowed"
//       ),
//       false
//     );
//   }
// };

// // Use `.fields()` to specify `banner` and `audio` separately
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
// }).fields([
//   { name: "banner", maxCount: 1 },
//   { name: "audio", maxCount: 1 },
// ]);

const upload = multer({
  storage,
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

// const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = "uploads/media/";
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `Media${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

// // Configure multer without file type and size restrictions
// const upload = multer({
//   storage,
// }).fields([
//   { name: "banner", maxCount: 1 },
//   { name: "audio", maxCount: 1 },
// ]);

// export const store = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error("Multer error:", err);
//       return res.status(400).json({
//         success: false,
//         message: "File upload error",
//         error: err.message,
//       });
//     }

//     try {
//       if (!req.user || !req.user.userId) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       const {
//         title,
//         description,
//         type,
//         category_id,
//         duration,
//         language,
//         tags,
//         cast,
//         crew,
//         release_date,
//       } = req.body;
//       const userId = req.user.userId;

//       const bannerPath = req.files["banner"]
//         ? req.files["banner"][0].path.replace(/\\/g, "/")
//         : null;
//       const audioPath = req.files["audio"]
//         ? req.files["audio"][0].path.replace(/\\/g, "/")
//         : null;

//       // Create media entry
//       const newMedia = await Media.create({
//         user_id: userId,
//         title,
//         description,
//         type,
//         category_id,
//         banner: bannerPath,
//         audio: audioPath,
//         duration,
//         language,
//         tags,
//         cast,
//         crew,
//         release_date,
//       });

//       res.json({
//         success: true,
//         message: "Media uploaded successfully",
//         media: newMedia,
//       });
//     } catch (error) {
//       console.error("Server error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Server error",
//         error: error.message,
//       });
//     }
//   });
// };

export const getMedia = async (req, res) => {
  try {
    const { category_id, all } = req.query;

    // Dynamic where clause based on `all` param
    const whereClause = {
      ...(category_id && { category_id }),
      ...(all === "true" ? {} : { media_status: 1 }), // default → only approved (status 1)
    };

    // Step 1: Fetch all media items
    const mediaItems = await Media.findAll({ where: whereClause });

    // Step 2: Get all category IDs and user IDs from the media items
    const categoryIds = [
      ...new Set(
        mediaItems.map((media) => media.category_id).filter((id) => id)
      ),
    ];
    const userIds = [
      ...new Set(mediaItems.map((media) => media.user_id).filter((id) => id)),
    ];

    // Step 3: Fetch all categories and users in bulk
    const categories = await Category.findAll({
      where: { category_id: categoryIds },
      attributes: ["category_id", "category_name"],
    });
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "name"],
    });

    // Step 4: Create lookup maps
    const categoryMap = new Map(
      categories.map((cat) => [cat.category_id, cat.category_name])
    );
    const userMap = new Map(users.map((user) => [user.id, user.name]));

    // Step 5: Enrich media items
    const mediaWithBaseUrl = mediaItems.map((media) => {
      const mediaJSON = media.toJSON();
      return {
        ...mediaJSON,
        banner: mediaJSON.banner ? `${BASE_URL}/${mediaJSON.banner}` : null,
        audio: mediaJSON.audio ? `${BASE_URL}/${mediaJSON.audio}` : null,
        category_name: categoryMap.get(mediaJSON.category_id) || null,
        username: userMap.get(mediaJSON.user_id) || null,
      };
    });

    // Step 6: Send the response
    res.json({
      success: true,
      data: mediaWithBaseUrl,
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

    // Step 1: Extract category IDs
    const categoryIds = [
      ...new Set(mediaItems.map((m) => m.category_id).filter(Boolean)),
    ];
    const userId = req.user.userId;

    // Step 2: Fetch category names and current user name
    const [categories, user] = await Promise.all([
      Category.findAll({
        where: { category_id: categoryIds },
        attributes: ["category_id", "category_name"],
      }),
      User.findOne({
        where: { id: userId },
        attributes: ["id", "name"],
      }),
    ]);

    const categoryMap = new Map(
      categories.map((cat) => [cat.category_id, cat.category_name])
    );

    // Step 3: Enrich media items
    const mediaWithBaseUrl = mediaItems.map((media) => {
      const mediaJSON = media.toJSON();
      return {
        ...mediaJSON,
        banner: mediaJSON.banner ? `${BASE_URL}/${mediaJSON.banner}` : null,
        audio: mediaJSON.audio ? `${BASE_URL}/${mediaJSON.audio}` : null,
        category_name: categoryMap.get(mediaJSON.category_id) || null,
        username: user?.name || null,
      };
    });

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

export const updateMediaStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { media_status } = req.body;

    if (media_status === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "media_status is required" });
    }

    const media = await Media.findByPk(id);

    if (!media) {
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });
    }

    // Update media status
    media.media_status = media_status;
    await media.save();

    return res.status(200).json({
      success: true,
      message: "Media status updated successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
