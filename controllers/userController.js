import User from "../models/userModel.js";

// Get the authenticated user's info
export const getUser = async (req, res) => {
  try {
    // res.json({ messag: req.user.userId });
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({
      success: false,
      where: { id: req.user.userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user.get({ plain: true });

    res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
