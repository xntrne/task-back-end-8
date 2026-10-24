import crypto from "node:crypto";
import bcrypt from "bcrypt";
import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
} from "../queries/auth.queries.js";
import { loginSchema, registerSchema } from "../validation-schemas/auth.js";

export const authRouter = express.Router();

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

// register
authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res
      .status(422)
      .json({ errors: { email: { errors: ["email already in use"] } } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({ username, email, passwordHash });

  res.status(201).json({ message: "register successful, you can now login" });
});

// login
authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  const passwordMatches =
    user && (await bcrypt.compare(password, user.passwordHash));

  if (!passwordMatches) {
    return res.status(401).json({ error: "invalid email or password" });
  }

  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  await createSession({ sessionId, userId: user.id, expiresAt });

  res.cookie("blog_session", sessionId, {
    httpOnly: true,
    maxAge: SESSION_DURATION,
  });

  res.json({
    message: "login successful",
    data: {
      user: { id: user.id, email: user.email, username: user.username },
    },
  });
});

// logout
authRouter.post("/logout", async (req, res) => {
  const sessionId = req.cookies.blog_session;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  res.clearCookie("blog_session");
  res.json({ message: "logout successful" });
});

// current user
authRouter.get("/me", checkAuth, (req, res) => {
  res.json({ data: { user: req.user } });
});
