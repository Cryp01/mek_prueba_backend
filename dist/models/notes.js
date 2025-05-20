"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
    const Note = sequelize.define("Note", {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: "id",
        },
        title: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        format: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            defaultValue: "plain_text",
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: "user_id",
        },
        color: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
        },
        status: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "active",
        },
        priority: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        tableName: "notes",
        timestamps: true,
        underscored: true,
    });
    const NotesService = {
        async createNote(noteData) {
            return await Note.create(noteData);
        },
        async getNotes(userId, options = {}) {
            const { status = "active", searchTerm, limit = 20, offset = 0, orderBy = "updatedAt", orderDir = "DESC", } = options;
            const where = { userId };
            if (status) {
                where.status = status;
            }
            if (searchTerm) {
                where[sequelize_1.Op.or] = [
                    { title: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { content: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                ];
            }
            return await Note.findAndCountAll({
                where,
                limit,
                offset,
                order: [[orderBy, orderDir]],
            });
        },
        async getNoteById(noteId, userId) {
            return await Note.findOne({
                where: { id: noteId, userId },
            });
        },
        async updateNote(noteId, userId, updateData) {
            const note = await Note.findOne({
                where: { id: noteId, userId },
            });
            if (!note) {
                throw new Error("Note not found");
            }
            return await note.update(updateData);
        },
        async deleteNote(noteId, userId, permanent = false) {
            if (permanent) {
                return await Note.destroy({
                    where: { id: noteId, userId },
                });
            }
            else {
                return await Note.update({ status: "deleted" }, { where: { id: noteId, userId } });
            }
        },
    };
    return {
        Note,
        NotesService,
    };
}
