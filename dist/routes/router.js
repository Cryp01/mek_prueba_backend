"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const auth_1 = __importDefault(require("../auth/auth"));
const connection_1 = __importDefault(require("../database/connection"));
const { Auth } = (0, auth_1.default)(connection_1.default);
const route = new koa_router_1.default();
exports.route = route;
route.get("/", async (ctx) => {
    ctx.body = "Hello World!";
});
route.post("/register", async (ctx) => {
    const { email, password } = ctx.request.body;
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
    const { email, password } = ctx.request.body;
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
