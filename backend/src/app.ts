import express from "express";
import cors from "cors";
import wordRouter from "./routes/word";
import collectionRouter from "./routes/collection";
import type { Request, Response, NextFunction } from "express";
import authRouter from "./routes/auth";
import { authMiddleware } from "./middleware/auth";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))
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
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Bad input" });
  }
  res.status(500).json({ message: "Server error" });
});

export default app;
