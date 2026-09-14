import Word from "../models/Word";
import type { NextFunction, Request, Response } from "express";
import { parseObjectIdParam } from "./utils";

export const getWords = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const words = await Word.find({ userId: req.userId });
    res.json(words);
  } catch (error) {
    next(error);
  }
};

export const getWordsByCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const collectionId = parseObjectIdParam(req.params.collectionId);
     if(collectionId === null) {
      res.status(404).json({ message: "Collection not found" });
      return;
    }
    const words = await Word.find({
      collectionId: collectionId,
      userId: req.userId,
    });
    res.json(words);
  } catch (error) {
    next(error);
  }
};

export const createWord = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const word = req.body.word;
    const translation = req.body.translation;
    const collectionId = req.body.collectionId;
    if (!word || !translation || !collectionId) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const savedWord = await Word.create({
      word,
      translation,
      collectionId,
      userId: req.userId,
    });
    res.status(201).json(savedWord);
  } catch (error) {
    next(error);
  }
};

export const deleteWord = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseObjectIdParam(req.params.id);
     if(id === null) {
      res.status(404).json({ message: "Word not found" });
      return;
    }
    const deletedWord = await Word.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });
    if (!deletedWord) {
      res.status(404).json({ message: "Word not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getQuizWords = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { collectionIds } = req.query;
    const ids = Array.isArray(collectionIds)
      ? collectionIds
      : [collectionIds];
    const words = await Word.aggregate([
      { $match: { collectionId: { $in: ids }, userId: req.userId } },
      { $sample: { size: 30 } },
    ]);
    res.json(words);
  } catch (error) {
    next(error);
  }
};
