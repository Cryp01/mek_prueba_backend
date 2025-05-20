import { Model, DataTypes, Sequelize, Optional, Op } from "sequelize";

interface NoteAttributes {
  id: number;
  title: string;
  content: string;
  format: string;
  userId: number;
  color: string;
  status: string;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NoteCreationAttributes
  extends Optional<
    NoteAttributes,
    "id" | "createdAt" | "updatedAt" | "color" | "status" | "priority"
  > {}

interface NoteModel
  extends Model<NoteAttributes, NoteCreationAttributes>,
    NoteAttributes {}

export default function (sequelize: Sequelize) {
  const Note = sequelize.define<NoteModel>(
    "Note",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "id",
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      format: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "plain_text",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      color: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "active",
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "notes",
      timestamps: true,
      underscored: true,
    }
  );

  const NotesService = {
    async createNote(noteData: NoteCreationAttributes) {
      return await Note.create(noteData);
    },

    async getNotes(
      userId: number,
      options: {
        status?: string;
        searchTerm?: string;
        limit?: number;
        offset?: number;
        orderBy?: string;
        orderDir?: "ASC" | "DESC";
      } = {}
    ) {
      const {
        status = "active",
        searchTerm,
        limit = 20,
        offset = 0,
        orderBy = "updatedAt",
        orderDir = "DESC",
      } = options;

      const where: any = { userId };

      if (status) {
        where.status = status;
      }

      if (searchTerm) {
        where[Op.or] = [
          { title: { [Op.like]: `%${searchTerm}%` } },
          { content: { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }

      return await Note.findAndCountAll({
        where,
        limit,
        offset,
        order: [[orderBy, orderDir]],
      });
    },

    async getNoteById(noteId: number, userId: number) {
      return await Note.findOne({
        where: { id: noteId, userId },
      });
    },

    async updateNote(
      noteId: number,
      userId: number,
      updateData: Partial<NoteAttributes>
    ) {
      const note = await Note.findOne({
        where: { id: noteId, userId },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      return await note.update(updateData);
    },

    async deleteNote(
      noteId: number,
      userId: number,
      permanent: boolean = false
    ) {
      if (permanent) {
        return await Note.destroy({
          where: { id: noteId, userId },
        });
      } else {
        return await Note.update(
          { status: "deleted" },
          { where: { id: noteId, userId } }
        );
      }
    },
  };

  return {
    Note,
    NotesService,
  };
}
