import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoute.js";
import CategoryRoutes from "./routes/categoryRoutes.js";
import MediaRoutes from "./routes/mediaRoute.js";
import path from "path";
import myCache from "node-cache";

// Load environment variables
dotenv.config();

const app = express();

// List of allowed origins
const allowedOrigins = [
  "http://localhost:3000", // Local development
  "http://seek-fm.vercel.app", // Production frontend
  "https://seek-fm.vercel.app", // Include HTTPS version for production
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the request origin is in the allowedOrigins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies or auth headers (if needed)
};

// Middlewares
app.use(cors(corsOptions)); // Apply CORS with options
app.use(express.json()); // Parse JSON bodies
app.use(helmet()); // Add security headers

// Serve static files (e.g., uploaded media)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", CategoryRoutes);
app.use("/api", MediaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

myCache.flushAll();
// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});