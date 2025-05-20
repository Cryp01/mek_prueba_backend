import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Context, Next } from "koa";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

interface UserAttributes {
  id: number;
  email: string;
  password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

interface UserModel
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

interface JwtPayload {
  id: number;
  email: string;
}

export default function (sequelize: Sequelize) {
  const User = sequelize.define<UserModel>(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "id",
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value: string) {
          const hash = bcrypt.hashSync(value, SALT_ROUNDS);
          this.setDataValue("password", hash);
        },
      },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  const Auth = {
    async register(email: string, password: string) {
      try {
        const user = await User.create({ email, password });
        const token = jwt.sign({ id: user.id, email }, JWT_SECRET);
        return { user, token };
      } catch (error) {
        return { error: "Registration failed" };
      }
    },

    async login(email: string, password: string) {
      try {
        const user = await User.findOne({ where: { email } });

        if (!user) return { error: "Invalid credentials" };

        const isValid = await bcrypt.compare(
          password,
          user.getDataValue("password")
        );
        if (!isValid) return { error: "Invalid credentials" };

        const token = jwt.sign({ id: user.id, email }, JWT_SECRET);
        return { user, token };
      } catch (error) {
        return { error: "Login failed" };
      }
    },

    verify(ctx: Context, next: Next) {
      try {
        const token = ctx.headers.authorization?.split(" ")[1];
        if (!token) {
          ctx.status = 401;
          ctx.body = { error: "Authentication required" };
          return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        ctx.state.user = decoded;
        return next();
      } catch (error) {
        ctx.status = 401;
        ctx.body = { error: "Invalid token" };
      }
    },
  };

  return { User, Auth };
}
