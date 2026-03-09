
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
config()

// const sequelize = new Sequelize(process.env.DB_URL, {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false  // SSL sertifikatni qabul qilish
//     }
//   },
//   logging: false,
// });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false
  }
);

export default sequelize;
