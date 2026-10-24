import { findUserBySessionId } from "../queries/auth.queries.js";

export async function checkAuth(req, res, next) {
  const sessionId = req.cookies.blog_session;

  if (!sessionId) {
    return res.status(401).json({ error: "invalid session" });
  }

  const user = await findUserBySessionId(sessionId);

  if (!user) {
    return res.status(401).json({ error: "invalid session" });
  }

  req.user = user;
  next();
}
