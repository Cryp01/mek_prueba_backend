"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const koa_router_1 = __importDefault(require("koa-router"));
const auth_1 = __importDefault(require("../auth/auth"));
const connection_1 = __importDefault(require("../database/connection"));
const { Auth } = (0, auth_1.default)(connection_1.default);
function default_1(JnotesService) {
    const router = new koa_router_1.default({
        prefix: "/api/notes",
    });
    const checkNoteOwnership = async (ctx, next) => {
        const noteId = parseInt(ctx.params.id);
        const userId = ctx.state.user.id;
        const note = await JnotesService.getNoteById(noteId, userId);
        if (!note) {
            ctx.status = 404;
            ctx.body = { success: false, message: "Note not found" };
            return;
        }
        ctx.state.note = note;
        await next();
    };
    router.post("/", Auth.verify, async (ctx) => {
        const userId = ctx.state.user.id;
        const noteData = ctx.request.body;
        try {
            const note = await JnotesService.createNote({
                ...noteData,
                userId,
            });
            ctx.status = 201;
            ctx.body = {
                success: true,
                data: note,
            };
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: error.message || "Failed to create note",
            };
        }
    });
    router.get("/", Auth.verify, async (ctx) => {
        const userId = ctx.state.user.id;
        const { status, search: searchTerm, limit = "20", page = "1", sortBy: orderBy = "updatedAt", sortDir = "DESC", } = ctx.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        try {
            const { rows: notes, count } = await JnotesService.getNotes(userId, {
                status: status,
                searchTerm: searchTerm,
                limit: parseInt(limit),
                offset,
                orderBy: orderBy,
                orderDir: sortDir,
            });
            ctx.body = {
                success: true,
                data: notes,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / parseInt(limit)),
                },
            };
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: error.message || "Failed to fetch notes",
            };
        }
    });
    router.get("/:id", Auth.verify, checkNoteOwnership, async (ctx) => {
        ctx.body = {
            success: true,
            data: ctx.state.note,
        };
    });
    router.put("/:id", Auth.verify, checkNoteOwnership, async (ctx) => {
        const noteId = parseInt(ctx.params.id);
        const userId = ctx.state.user.id;
        const updateData = ctx.request.body;
        try {
            const updatedNote = await JnotesService.updateNote(noteId, userId, updateData);
            ctx.body = {
                success: true,
                data: updatedNote,
            };
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: error.message || "Failed to update note",
            };
        }
    });
    router.delete("/:id", Auth.verify, checkNoteOwnership, async (ctx) => {
        const noteId = parseInt(ctx.params.id);
        const userId = ctx.state.user.id;
        const { permanent = "false" } = ctx.query;
        try {
            await JnotesService.deleteNote(noteId, userId, permanent === "true");
            ctx.body = {
                success: true,
                message: permanent === "true"
                    ? "Note permanently deleted"
                    : "Note moved to trash",
            };
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: error.message || "Failed to delete note",
            };
        }
    });
    return router;
}
