import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessions, users } from "../db/schema.js";

// find user by email
export async function findUserByEmail(email) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

// create user
export async function createUser({ username, email, passwordHash }) {
  await db.insert(users).values({ username, email, passwordHash });
}

// create session
export async function createSession({ sessionId, userId, expiresAt }) {
  await db.insert(sessions).values({ sessionId, userId, expiresAt });
}

// find user by a valid session
export async function findUserBySessionId(sessionId) {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(eq(sessions.sessionId, sessionId), gt(sessions.expiresAt, new Date()))
    );

  return user;
}

// delete session
export async function deleteSession(sessionId) {
  await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
}
