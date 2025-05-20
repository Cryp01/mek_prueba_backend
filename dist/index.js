"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router_1 = require("./routes/router");
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_1 = __importDefault(require("koa"));
const cors_1 = __importDefault(require("@koa/cors"));
const connection_1 = __importDefault(require("./database/connection"));
const notes_1 = __importDefault(require("./routes/notes"));
const notes_2 = __importDefault(require("./models/notes"));
const app = new koa_1.default();
app.use((0, cors_1.default)());
//request
app.use(async ({ request }, next) => {
    console.log(`${request.method} ${request.url}`);
    await next();
});
//middlewares
connection_1.default
    .authenticate()
    .then(() => {
    console.log("Connection has been established successfully.");
})
    .catch((err) => {
    console.error("Unable to connect to the database:", err);
});
const { NotesService } = (0, notes_2.default)(connection_1.default);
const notesRouter = (0, notes_1.default)(NotesService);
app.use((0, koa_bodyparser_1.default)());
app.use(router_1.route.allowedMethods());
app.use(router_1.route.routes());
app.use(notesRouter.routes());
(async () => {
    console.clear();
    app.listen(process.env.port || "8080", () => {
        console.log(`Server listening on port: ${process.env.port || "8080"}`);
    });
})();
