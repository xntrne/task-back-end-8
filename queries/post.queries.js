import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, likes, posts, users } from "../db/schema.js";

// columns shared by the list and single post queries
function postColumns(currentUserId) {
  return {
    id: posts.id,
    content: posts.content,
    image: posts.image,
    created_at: posts.createdAt,
    username: users.username,
    like_count: sql`(select count(*) from ${likes} where ${likes.postId} = ${posts.id})`.mapWith(
      Number
    ),
    comment_count: sql`(select count(*) from ${comments} where ${comments.postId} = ${posts.id})`.mapWith(
      Number
    ),
    liked_by_me: sql`exists (select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${currentUserId})`.mapWith(
      Boolean
    ),
  };
}

// get all posts
export async function getAllPosts(currentUserId) {
  return db
    .select(postColumns(currentUserId))
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));
}

// get one post
export async function getPostById(postId, currentUserId) {
  const [post] = await db
    .select(postColumns(currentUserId))
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, postId));

  return post;
}

// check that a post exists
export async function postExists(postId) {
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, postId));

  return Boolean(post);
}

// create post
export async function createPost({ userId, content, image }) {
  const [post] = await db
    .insert(posts)
    .values({ userId, content, image })
    .returning({
      id: posts.id,
      user_id: posts.userId,
      content: posts.content,
      image: posts.image,
      created_at: posts.createdAt,
    });

  return post;
}

// toggle like
export async function toggleLike(userId, postId) {
  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));

  if (existing) {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  } else {
    await db.insert(likes).values({ userId, postId });
  }

  const [{ count }] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(likes)
    .where(eq(likes.postId, postId));

  return { liked: !existing, like_count: count };
}
