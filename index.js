import cookieParser from "cookie-parser";
import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { pagesRouter } from "./routes/pages.routes.js";
import { postRouter } from "./routes/post.routes.js";

const app = express();

app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});

app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/auth", authRouter);
app.use("/api/posts", postRouter);
app.use(pagesRouter);

app.use((err, req, res, next) => {
  console.log("err", err);
  res.status(500).json({ error: "something went wrong" });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
