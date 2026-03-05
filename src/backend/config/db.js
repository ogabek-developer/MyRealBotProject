
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
config()



const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false  // SSL sertifikatni qabul qilish
    }
  },
  logging: false,
});

export default sequelize;
