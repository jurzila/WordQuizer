import { Router } from "express";
import {
  createCollection,
  deleteCollection,
  getCollection,
  getCollections,
  updateCollection,
} from "../controllers/collectionController";

const collectionRouter = Router();
collectionRouter.get("/", getCollections);
collectionRouter.post("/", createCollection);
collectionRouter.get("/:collectionId", getCollection);
collectionRouter.put("/:collectionId", updateCollection);
collectionRouter.delete("/:collectionId", deleteCollection);

export default collectionRouter;
