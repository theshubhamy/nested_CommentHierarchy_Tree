// models/comment.js
import { DataTypes } from "sequelize";
import sequelize from "../utils/database.js";
const Comment = sequelize.define("Comment", {
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Comment.hasMany(Comment, { as: "replies", foreignKey: "parentCommentId" });
Comment.belongsTo(Comment, { as: "parent", foreignKey: "parentCommentId" });

export default Comment;
