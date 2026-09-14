import mongoose from "mongoose";

export const parseObjectIdParam = (id: unknown): string | null => {
  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return id;
};
