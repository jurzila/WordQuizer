import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      requered: true,
      trim: true,
    },
    translation: {
      type: String,
      requered: true,
      trim: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      requered: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Word", wordSchema);
