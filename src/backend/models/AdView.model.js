import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AdView = sequelize.define("AdView", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  ad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Advertisements", // jadval nomi (plural)
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },

  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },

  viewed_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default AdView;