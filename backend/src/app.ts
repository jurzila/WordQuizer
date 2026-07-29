import express from "express";
import cors from "cors";
import wordRouter from "./routes/word";
import collectionRouter from "./routes/collection";
import type { Request, Response, NextFunction } from "express";
import authRouter from "./routes/auth";
import { authMiddleware } from "./middleware/auth";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/word", authMiddleware, wordRouter);
app.use("/api/collection", authMiddleware, collectionRouter);
app.use("/api/auth", authRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error.message);
  console.error(error.stack);
  res.status(500).json({ message: error.message || "Server error" });
});

export default app;
