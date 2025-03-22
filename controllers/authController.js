import  User from "../models/userModel.js";
// import { User } from "../config/syncDatabase.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, phone });

    // Remove password before sending the response
    const { password: _, ...userWithoutPassword } = user.get({ plain: true });

    return res.status(200).json({
      success: true,
      message: "User registered",
      user: userWithoutPassword,
  });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const { password: _, ...userWithoutPassword } = user.get({ plain: true });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
