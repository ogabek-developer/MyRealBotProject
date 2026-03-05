

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
  ram: DataTypes.STRING,
  rom: DataTypes.STRING,
  goods_condition: DataTypes.STRING,
  short_description: DataTypes.TEXT,
  views: { type: DataTypes.BIGINT, defaultValue: 1 },
});


// Advertisements and Client assocattion

Advertisement.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Advertisement, { foreignKey: 'clientId', as: 'ads' });

export default Advertisement;
