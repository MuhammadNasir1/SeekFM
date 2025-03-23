import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
const Category = sequelize.define(
  "Category",
  {
    category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    category_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
  }
);
export default Category;
