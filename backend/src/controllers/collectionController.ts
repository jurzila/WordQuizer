import type { NextFunction, Request, Response } from "express";
import Collection from "../models/Collection";
import Word from "../models/Word";

export const getCollections = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const collections = await Collection.find();
    res.json(collections);
  } catch (error) {
    next(error);
  }
};

export const createCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }
    const collection = await Collection.create({ name });
    res.status(201).json(collection);
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const collectionId = req.params.collectionId;
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      res.status(404).json({ message: "Collection not found" });
      return;
    }

    const { deletedCount } = await Word.deleteMany({ collectionId });
    await Collection.findByIdAndDelete(collectionId);

    res.json({ message: "Collection deleted", wordsDeleted: deletedCount });
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const collectionId = req.params.id;
    const name = req.body.name;
    if (!name || !collectionId) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { name },
      { new: true },
    );
    if (!updatedCollection) {
      res.status(404).json({ message: "Collection not found" });
      return;
    }
    res.json(updatedCollection);
  } catch (error) {
    next(error);
  }
};
