import Router, { IRouterContext } from "koa-router";
import userAuth from "../auth/auth";
import sequelize from "../database/connection";
const { Auth } = userAuth(sequelize);

const route = new Router();

route.get("/", async (ctx: IRouterContext) => {
  ctx.body = "Hello World!";
});

interface UserRequestBody {
  email: string;
  password: string;
}

route.post("/register", async (ctx) => {
  const { email, password } = ctx.request.body as UserRequestBody;
  if (!email || !password) {
    ctx.status = 400;
    ctx.body = { error: "Email and password are required" };
    return;
  }
  if (password.length < 6) {
    ctx.status = 400;
    ctx.body = { error: "Password must be at least 6 characters long" };
    return;
  }

  ctx.body = await Auth.register(email, password);
});

route.post("/login", async (ctx) => {
  const { email, password } = ctx.request.body as UserRequestBody;
  if (!email || !password) {
    ctx.status = 400;
    ctx.body = { error: "Email and password are required" };
    return;
  }

  ctx.body = await Auth.login(email, password);
});

route.get("/profile", Auth.verify, async (ctx) => {
  ctx.body = { message: "Authenticated", user: ctx.state.user };
});

export { route };
