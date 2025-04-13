import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/userRoute.js";
import CategoryRoutes from "./routes/categoryRoutes.js";
import MediaRoutes from "./routes/mediaRoute.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path";

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all origins, no auth headers needed
app.use(cors()); // Allow all origins by default
app.use(express.json()); // Parse JSON bodies
app.use(helmet()); // Add security headers

// Serve static files (e.g., uploaded media)
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(process.cwd(), "uploads")));


// Routes (authRoutes removed)
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", CategoryRoutes);
app.use("/api", MediaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
