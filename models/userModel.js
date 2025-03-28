import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcryptjs";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: null,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    followers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    following: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    user_image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    channel_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    channel_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    channel_media_links: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    user_role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "appUser",
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving user
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

export default User;
