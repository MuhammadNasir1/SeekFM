import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoute.js";
import CategoryRoutes from "./routes/categoryRoutes.js";
import MediaRoutes from "./routes/mediaRoute.js";
import path from "path";
dotenv.config();;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", CategoryRoutes);
app.use("/api", MediaRoutes);

app.use(
  cors({
    origin: "*", // or restrict to your frontend domain
  })
);
// Start the server and sync database
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(process.cwd(), 'uploads')));
