import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Client from './Client.model.js';

const Advertisement = sequelize.define('Advertisement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  advertisement_name: DataTypes.STRING,
  price: DataTypes.FLOAT,
  goods_picture: DataTypes.TEXT,
  price_currency: { type: DataTypes.ENUM('usd','uzs'), defaultValue: 'uzs' },
  model: DataTypes.STRING,

  // RAM enum
  ram: {
    type: DataTypes.ENUM('2GB','3GB','4GB','6GB','8GB','12GB','16GB'),
    allowNull: false
  },

  // ROM enu
  rom: {
    type: DataTypes.ENUM('16GB','32GB','64GB','128GB','256GB','512GB','1TB'),
    allowNull: false
  },

   goods_condition: {
    type: DataTypes.ENUM(
      'yangi',       
      'ishlatilgan',  
      'qisman tiklangan',
      'новый',          
      'использованный', 
      'отремонтированный'
    ),
    allowNull: false,
    defaultValue: 'yangi'
  },

  short_description: DataTypes.TEXT,

  region: {
    type: DataTypes.ENUM(
      'Toshkent',
      'Andijon',
      'Fargona',
      'Namangan',
      'Samarqand',
      'Buxoro',
      'Xorazm',
      'Qashqadaryo',
      'Surxondaryo',
      'Jizzax',
      'Sirdaryo',
      'Navoiy'
    ),
    allowNull: false,
    defaultValue: 'Toshkent'
  },

  views: { type: DataTypes.BIGINT, defaultValue: 1 },
});

// Advertisements and Client association
Advertisement.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Advertisement, { foreignKey: 'clientId', as: 'ads' });

export default Advertisement;