import { Router } from "express";
import {
  createWord,
  deleteWord,
  getQuizWords,
  getWords,
  getWordsByCollection,
} from "../controllers/wordController";

const wordRouter = Router();
wordRouter.get("/quiz", getQuizWords);
wordRouter.get("/", getWords);
wordRouter.get("/collection/:collectionId", getWordsByCollection);
wordRouter.post("/", createWord);
wordRouter.delete("/:id", deleteWord);

export default wordRouter;
