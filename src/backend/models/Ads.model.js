import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Client from "./Client.model.js";

const Advertisement = sequelize.define("Advertisement", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  advertisement_name: DataTypes.STRING,

  price: DataTypes.FLOAT,

  // ── goods_picture: 1–3 ta Cloudinary URL, JSON array sifatida TEXT da saqlanadi ──
  // Saqlanadi: '["https://res.cloudinary.com/...", ...]'
  // O'qiladi:  getter orqali avtomatik parse qilinadi
  goods_picture: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const raw = this.getDataValue("goods_picture");
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [raw];
      } catch {
        return [raw];
      }
    },
    set(value) {
      // Array yoki string — ikkalasini ham qabul qilamiz
      if (Array.isArray(value)) {
        this.setDataValue("goods_picture", JSON.stringify(value));
      } else {
        this.setDataValue("goods_picture", value);
      }
    },
  },

  price_currency: {
    type: DataTypes.ENUM("usd", "uzs"),
    defaultValue: "uzs",
  },

  model: DataTypes.STRING,

  ram: {
    type: DataTypes.ENUM("2GB","3GB","4GB","6GB","8GB","12GB","16GB"),
    allowNull: false,
  },

  rom: {
    type: DataTypes.ENUM("16GB","32GB","64GB","128GB","256GB","512GB","1TB"),
    allowNull: false,
  },

  goods_condition: {
    type: DataTypes.ENUM(
      "yangi",
      "ishlatilgan",
      "qisman tiklangan",
      "новый",
      "использованный",
      "отремонтированный"
    ),
    allowNull: false,
    defaultValue: "yangi",
  },

  short_description: DataTypes.TEXT,

  region: {
    type: DataTypes.ENUM(
      "Toshkent","Andijon","Fargona","Namangan","Samarqand","Buxoro",
      "Xorazm","Qashqadaryo","Surxondaryo","Jizzax","Sirdaryo","Navoiy"
    ),
    allowNull: false,
    defaultValue: "Toshkent",
  },

  views: {
    type: DataTypes.BIGINT,
    defaultValue: 1,
  },
});

// ── Associations ──────────────────────────────────────────────────────────────
Advertisement.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Advertisement, { foreignKey: "clientId", as: "ads" });

export default Advertisement;