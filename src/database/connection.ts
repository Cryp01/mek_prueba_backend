import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.db_name || "database",
  process.env.db_user || "user",
  process.env.db_password || "password",
  {
    dialect: "postgres",
    host: process.env.db_host || "localhost",
    port: Number(process.env.db_port) || 5432,
  }
);

export default sequelize;
