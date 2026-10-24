import { createInsertSchema } from "drizzle-zod";
import { comments, posts } from "../db/schema.js";

// create post
export const createPostSchema = createInsertSchema(posts, {
  content: (schema) =>
    schema
      .trim()
      .min(1, "post content cannot be empty")
      .max(5000, "post content cannot be longer than 5000 characters"),
}).pick({ content: true });

// create comment
export const createCommentSchema = createInsertSchema(comments, {
  content: (schema) =>
    schema
      .trim()
      .min(1, "comment cannot be empty")
      .max(2000, "comment cannot be longer than 2000 characters"),
}).pick({ content: true });
