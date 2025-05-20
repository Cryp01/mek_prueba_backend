import Router from "koa-router";
import { Context, Next } from "koa";
import userAuth from "../auth/auth";
import sequelize from "../database/connection";
const { Auth } = userAuth(sequelize);

interface NoteService {
  getNoteById: (noteId: number, userId: number) => Promise<any>;
  createNote: (noteData: any) => Promise<any>;
  getNotes: (
    userId: number,
    options: any
  ) => Promise<{ rows: any[]; count: number }>;
  updateNote: (noteId: number, userId: number, updateData: any) => Promise<any>;
  deleteNote: (
    noteId: number,
    userId: number,
    permanent: boolean
  ) => Promise<any>;
}

export default function (JnotesService: NoteService) {
  const router = new Router({
    prefix: "/api/notes",
  });

  const checkNoteOwnership = async (ctx: Context, next: Next) => {
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

  router.post("/", Auth.verify, async (ctx: Context) => {
    const userId = ctx.state.user.id;
    const noteData = ctx.request.body as any;

    try {
      const note = await JnotesService.createNote({
        ...(noteData as object),
        userId,
      });

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: note,
      };
    } catch (error: any) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message || "Failed to create note",
      };
    }
  });

  router.get("/", Auth.verify, async (ctx: Context) => {
    const userId = ctx.state.user.id;

    const {
      status,
      search: searchTerm,
      limit = "20",
      page = "1",
      sortBy: orderBy = "updatedAt",
      sortDir = "DESC",
    } = ctx.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    try {
      const { rows: notes, count } = await JnotesService.getNotes(userId, {
        status: status as string,
        searchTerm: searchTerm as string,
        limit: parseInt(limit as string),
        offset,
        orderBy: orderBy as string,
        orderDir: sortDir as "ASC" | "DESC",
      });

      ctx.body = {
        success: true,
        data: notes,
        pagination: {
          total: count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(count / parseInt(limit as string)),
        },
      };
    } catch (error: any) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message || "Failed to fetch notes",
      };
    }
  });

  router.get("/:id", Auth.verify, checkNoteOwnership, async (ctx: Context) => {
    ctx.body = {
      success: true,
      data: ctx.state.note,
    };
  });

  router.put("/:id", Auth.verify, checkNoteOwnership, async (ctx: Context) => {
    const noteId = parseInt(ctx.params.id);
    const userId = ctx.state.user.id;
    const updateData = ctx.request.body;

    try {
      const updatedNote = await JnotesService.updateNote(
        noteId,
        userId,
        updateData
      );

      ctx.body = {
        success: true,
        data: updatedNote,
      };
    } catch (error: any) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message || "Failed to update note",
      };
    }
  });

  router.delete(
    "/:id",
    Auth.verify,
    checkNoteOwnership,
    async (ctx: Context) => {
      const noteId = parseInt(ctx.params.id);
      const userId = ctx.state.user.id;
      const { permanent = "false" } = ctx.query;

      try {
        await JnotesService.deleteNote(noteId, userId, permanent === "true");

        ctx.body = {
          success: true,
          message:
            permanent === "true"
              ? "Note permanently deleted"
              : "Note moved to trash",
        };
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: error.message || "Failed to delete note",
        };
      }
    }
  );

  return router;
}
