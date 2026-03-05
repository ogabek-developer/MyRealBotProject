import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // ⭐ TELEGRAM ID (ASOSIY IDENTIFIKATOR)
  tg_id: {
    type: DataTypes.BIGINT,
    unique: true,
    allowNull:false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  tg_username: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  registered_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  last_seen_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  platform_language: {
    type: DataTypes.ENUM("uz", "ru"),
    allowNull: true,
  },

  step: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "authentication",
  },
});

export default Admin;
