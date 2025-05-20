"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;
function default_1(sequelize) {
    const User = sequelize.define("User", {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: "id",
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            set(value) {
                const hash = bcrypt_1.default.hashSync(value, SALT_ROUNDS);
                this.setDataValue("password", hash);
            },
        },
    }, {
        tableName: "users",
        timestamps: true,
    });
    const Auth = {
        async register(email, password) {
            try {
                const user = await User.create({ email, password });
                const token = jsonwebtoken_1.default.sign({ id: user.id, email }, JWT_SECRET);
                return { user, token };
            }
            catch (error) {
                return { error: "Registration failed" };
            }
        },
        async login(email, password) {
            try {
                const user = await User.findOne({ where: { email } });
                if (!user)
                    return { error: "Invalid credentials" };
                const isValid = await bcrypt_1.default.compare(password, user.getDataValue("password"));
                if (!isValid)
                    return { error: "Invalid credentials" };
                const token = jsonwebtoken_1.default.sign({ id: user.id, email }, JWT_SECRET);
                return { user, token };
            }
            catch (error) {
                return { error: "Login failed" };
            }
        },
        verify(ctx, next) {
            try {
                const token = ctx.headers.authorization?.split(" ")[1];
                if (!token) {
                    ctx.status = 401;
                    ctx.body = { error: "Authentication required" };
                    return;
                }
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                ctx.state.user = decoded;
                return next();
            }
            catch (error) {
                ctx.status = 401;
                ctx.body = { error: "Invalid token" };
            }
        },
    };
    return { User, Auth };
}
