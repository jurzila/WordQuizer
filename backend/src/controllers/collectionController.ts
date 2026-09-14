import type { NextFunction, Request, Response } from "express";
import Collection from "../models/Collection";
import Word from "../models/Word";
import { parseObjectIdParam } from "./utils";

export const getCollections = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const collections = await Collection.find({ userId: req.userId });
    res.json(collections);
  } catch (error) {
    next(error);
  }
};

export const getCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const _id = parseObjectIdParam(req.params.collectionId);
    if(_id === null) {
      res.status(404).json({ message: "Collection not found" });
      return;
    }
    const collection = await Collection.findOne({ _id, userId: req.userId });
    if (!collection) {
      res.status(404).json({ message: "Collection not found" });
      return;
    }
    res.json(collection);
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
    const collection = await Collection.create({ name, userId: req.userId });
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
    const collectionId = parseObjectIdParam(req.params.collectionId);
    if(collectionId === null) {
      res.status(404).json({ message: "Collection not found" });
      return;
    }
    const collection = await Collection.findOne({
      _id: collectionId,
      userId: req.userId,
    });
    if (!collection) {
      res.status(404).json({ message: "Collection not found" });
      return;
    }

    const { deletedCount } = await Word.deleteMany({
      collectionId,
      userId: req.userId,
    });
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
    const collectionId = parseObjectIdParam(req.params.collectionId);
    if(collectionId === null) {
      res.status(404).json({ message: "Collection not found" });
      return;
    }
    const name = req.body.name;
    if (!name) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const updatedCollection = await Collection.findOneAndUpdate(
      { _id: collectionId, userId: req.userId },
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