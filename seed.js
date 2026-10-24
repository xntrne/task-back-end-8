import bcrypt from "bcrypt";
import { db, pool } from "./db/index.js";
import { comments, likes, posts, sessions, users } from "./db/schema.js";

// clear old data
await db.delete(likes);
await db.delete(comments);
await db.delete(posts);
await db.delete(sessions);
await db.delete(users);

// users
const passwordHash = await bcrypt.hash("Password1!", 10);

const [ahmed, sara, omar] = await db
  .insert(users)
  .values([
    { username: "ahmed", email: "ahmed@example.com", passwordHash },
    { username: "sara", email: "sara@example.com", passwordHash },
    { username: "omar", email: "omar@example.com", passwordHash },
  ])
  .returning();

// posts
const [post1, post2, post3] = await db
  .insert(posts)
  .values([
    { userId: ahmed.id, content: "Hello class! This is my first post." },
    { userId: sara.id, content: "Just finished the sessions lesson, cookies are fun." },
    { userId: omar.id, content: "Drizzle makes SQL feel a lot friendlier." },
  ])
  .returning();

// comments
await db.insert(comments).values([
  { postId: post1.id, userId: sara.id, content: "Welcome Ahmed!" },
  { postId: post1.id, userId: omar.id, content: "Nice first post." },
  { postId: post2.id, userId: ahmed.id, content: "Same here, it finally clicked." },
]);

// likes
await db.insert(likes).values([
  { userId: sara.id, postId: post1.id },
  { userId: omar.id, postId: post1.id },
  { userId: ahmed.id, postId: post2.id },
  { userId: ahmed.id, postId: post3.id },
]);

console.log("seed done, all users use the password: Password1!");

await pool.end();
