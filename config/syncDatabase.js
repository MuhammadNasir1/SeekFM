import sequelize from "./database.js";
import User from "../models/userModel.js";
import Category from "../models/categoryModel.js";

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    // await User.destroy({ where: {}, force: true });
    // await sequelize.drop();
    console.log("Database synchronized");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

// export { sequelize, User, syncDatabase };
syncDatabase();
