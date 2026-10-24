import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { uploadImage } from "../middleware/upload.js";
import { validateBody } from "../middleware/validateBody.js";
import {
  createComment,
  getCommentsByPostId,
} from "../queries/comment.queries.js";
import {
  createPost,
  getAllPosts,
  getPostById,
  postExists,
  toggleLike,
} from "../queries/post.queries.js";
import {
  createCommentSchema,
  createPostSchema,
} from "../validation-schemas/posts.js";

export const postRouter = express.Router();

// every post route needs a logged in user
postRouter.use(checkAuth);

// check the :id param
postRouter.param("id", (req, res, next, id) => {
  if (!/^\d{1,9}$/.test(id)) {
    return res.status(404).json({ error: "post not found" });
  }
  next();
});

// list posts
postRouter.get("/", async (req, res) => {
  const posts = await getAllPosts(req.user.id);
  res.json({ data: posts });
});

// create post
postRouter.post(
  "/",
  uploadImage("image"),
  validateBody(createPostSchema),
  async (req, res) => {
    const post = await createPost({
      userId: req.user.id,
      content: req.body.content,
      image: req.file ? req.file.filename : null,
    });

    res.status(201).json({ message: "post created successfully", data: post });
  }
);

// get one post
postRouter.get("/:id", async (req, res) => {
  const postId = Number(req.params.id);

  const post = await getPostById(postId, req.user.id);
  if (!post) {
    return res.status(404).json({ error: "post not found" });
  }

  const comments = await getCommentsByPostId(postId);
  res.json({ data: { post, comments } });
});

// like or unlike
postRouter.post("/:id/like", async (req, res) => {
  const postId = Number(req.params.id);

  if (!(await postExists(postId))) {
    return res.status(404).json({ error: "post not found" });
  }

  const result = await toggleLike(req.user.id, postId);
  res.json({ data: result });
});

// add comment
postRouter.post(
  "/:id/comments",
  validateBody(createCommentSchema),
  async (req, res) => {
    const postId = Number(req.params.id);

    if (!(await postExists(postId))) {
      return res.status(404).json({ error: "post not found" });
    }

    const comment = await createComment({
      postId,
      userId: req.user.id,
      content: req.body.content,
    });

    res.status(201).json({
      message: "comment created successfully",
      data: { ...comment, username: req.user.username },
    });
  }
);
