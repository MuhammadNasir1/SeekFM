import sequelize from '../config/database.js';
import User from './userModel.js';

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

export { sequelize, User, syncDatabase };
