import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";
import Category from "./categoryModel.js";

const Media = sequelize.define(
  "Media",
  {
    media_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    category_id: {
      type: DataTypes.INTEGER,

    },
    banner: {
      type: DataTypes.TEXT,
    },
    audio: {
      type: DataTypes.TEXT,
    },
    duration: {
      type: DataTypes.STRING(50),
    },
    language: {
      type: DataTypes.STRING(50),
    },

    tags: {
      type: DataTypes.TEXT,
    },
    cast: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    crew: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    release_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    listener: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    media_status: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

export default Media;
