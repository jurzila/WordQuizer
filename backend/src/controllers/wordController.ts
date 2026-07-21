import Word from "../models/Word";
import type { NextFunction, Request, Response } from "express";

export const getWords = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const words = await Word.find();
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
    const collectionId = req.params.collectionId;
    const words = await Word.find({ collectionId });
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
    const savedWord = await Word.create({ word, translation, collectionId });
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
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ message: "Invalid id" });
      return;
    }
    const deletedWord = await Word.findByIdAndDelete(id);
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
    const { colleactionIds } = req.query;
    const ids = Array.isArray(colleactionIds)
      ? colleactionIds
      : [colleactionIds];
    const words = await Word.aggregate([
      { $match: { colleactionId: { $in: ids } } },
      { $sample: { size: 30 } },
    ]);
    res.json(words);
  } catch (error) {
    next(error);
  }
};
