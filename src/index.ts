import dotenv from "dotenv";
dotenv.config();

import { route } from "./routes/router";
import bodyParser from "koa-bodyparser";
import koa from "koa";
import cors from "@koa/cors";

const app = new koa();

app.use(cors());

//request
app.use(async ({ request }, next) => {
  console.log(`${request.method} ${request.url}`);
  await next();
});

//middlewares
app.use(bodyParser());
app.use(route.allowedMethods());
app.use(route.routes());

(async () => {
  console.clear();

  app.listen(process.env.port || "8080", () => {
    console.log(`Server listening on port: ${process.env.port || "8080"}`);
  });
})();
