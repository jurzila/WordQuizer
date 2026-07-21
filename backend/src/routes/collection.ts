import { Router } from "express";
import {
  createCollection,
  deleteCollection,
  getCollections,
  updateCollection,
} from "../controllers/collectionController";

const collectionRouter = Router();
collectionRouter.get("/", getCollections);
collectionRouter.post("/", createCollection);
collectionRouter.put("/:collectionId", updateCollection);
collectionRouter.delete("/:collectionId", deleteCollection);

export default collectionRouter;
