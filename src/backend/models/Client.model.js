import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Client = sequelize.define("Client", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // ⭐ ASOSIY TELEGRAM IDENTIFIKATOR
  tg_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
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
    defaultValue: false,
  },

  advertisement_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },

  platform_language: {
    type: DataTypes.ENUM("uz", "ru"),
    allowNull: true,
  },

  client_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  registered_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  last_seen_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  step: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "authentication",
  },

  subscribed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default Client;
