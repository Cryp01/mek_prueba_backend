"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(process.env.db_name || "database", process.env.db_user || "user", process.env.db_password || "password", {
    dialect: "postgres",
    host: process.env.db_host || "localhost",
    port: Number(process.env.db_port) || 5432,
});
exports.default = sequelize;
