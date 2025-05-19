import Router, { IRouterContext } from "koa-router";

const route = new Router();

route.get("/", async (ctx: IRouterContext) => {
  ctx.body = "Hello World!";
});

export { route };
