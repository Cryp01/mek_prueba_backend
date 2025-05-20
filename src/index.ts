import dotenv from "dotenv";
dotenv.config();
import { route } from "./routes/router";
import bodyParser from "koa-bodyparser";
import koa from "koa";
import cors from "@koa/cors";
import sequelize from "./database/connection";
import createNotesRouter from "./routes/notes";
import notesModule from "./models/notes";

const app = new koa();

app.use(cors());

//request
app.use(async ({ request }, next) => {
  console.log(`${request.method} ${request.url}`);
  await next();
});

//middlewares
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const { NotesService } = notesModule(sequelize);

const notesRouter = createNotesRouter(NotesService);

app.use(bodyParser());
app.use(route.allowedMethods());
app.use(route.routes());
app.use(notesRouter.routes());

(async () => {
  console.clear();

  app.listen(process.env.port || "8080", () => {
    console.log(`Server listening on port: ${process.env.port || "8080"}`);
  });
})();
