import path from "path";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import sequelize from "./utils/database.js";
// controllers/UserController.js
import Comment from "./model/index.js";
if (process.env.NODE_ENV) {
  dotenv.config();
}

const port = process.env.PORT || 3300;

const app = express();

const __dirname = path.resolve();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

// Use the cors middleware to allow requests from all origins

// All routes entrypoint here
app.get("/", (req, res) => {
  res.status(200).json({
    msg: "Server is running🔥🔥🔥",
  });
});

app.use(helmet());
app.use(compression());
// end points
// Create a comment
app.post("/comments", async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const comment = await Comment.create({ content });
    if (parentCommentId) {
      const parentComment = await Comment.findByPk(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found." });
      }
      await comment.setParent(parentComment);
    }
    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating a comment." });
  }
});
// List CommentHierarchy (Recursive)
app.get("/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;

    // Validate that commentId is a number and not undefined
    if (isNaN(commentId) || commentId === undefined) {
      return res.status(400).json({ message: "Invalid commentId provided." });
    }

    const getCommentHierarchy = async (parentId) => {
      const comments = await Comment.findAll({
        where: { parentCommentId: parentId },
        include: [
          {
            model: Comment,
            as: "replies",
            include: [
              {
                model: Comment,
                as: "replies",
                include: [
                  {
                    model: Comment,
                    as: "replies",
                    include: [
                      {
                        model: Comment,
                        as: "replies",
                        include: [
                          {
                            model: Comment,
                            as: "replies",
                          },
                        ],
                        include: [
                          {
                            model: Comment,
                            as: "replies",
                            include: [
                              {
                                model: Comment,
                                as: "replies",
                                include: [
                                  {
                                    model: Comment,
                                    as: "replies",
                                    include: [
                                      {
                                        model: Comment,
                                        as: "replies",
                                        include: [
                                          {
                                            model: Comment,
                                            as: "replies",
                                            include: [
                                              {
                                                model: Comment,
                                                as: "replies",
                                                include: [
                                                  {
                                                    model: Comment,
                                                    as: "replies",
                                                    include: [
                                                      {
                                                        model: Comment,
                                                        as: "replies",
                                                        include: [
                                                          {
                                                            model: Comment,
                                                            as: "replies",
                                                          },
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (comments.length === 0) {
        return [];
      }

      const nestedComments = await Promise.all(
        comments.map(async (comment) => {
          comment.replies = await getCommentHierarchy(comment.id);
          return comment;
        })
      );

      return nestedComments;
    };

    const commentHierarchy = await getCommentHierarchy(commentId);

    return res.status(200).json(commentHierarchy);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching comments." });
  }
});

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
