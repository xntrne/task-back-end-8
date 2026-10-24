import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, users } from "../db/schema.js";

// get comments of a post
export async function getCommentsByPostId(postId) {
  return db
    .select({
      id: comments.id,
      content: comments.content,
      created_at: comments.createdAt,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt), asc(comments.id));
}

// create comment
export async function createComment({ postId, userId, content }) {
  const [comment] = await db
    .insert(comments)
    .values({ postId, userId, content })
    .returning({
      id: comments.id,
      content: comments.content,
      created_at: comments.createdAt,
    });

  return comment;
}
