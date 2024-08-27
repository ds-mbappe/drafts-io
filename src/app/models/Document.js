import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.MONGO_DB_URI);
mongoose.Promise = global.Promise

const documentSchema = new Schema(
  {
    _id: String,
    private: { type: Boolean, default: true },
    locked: { type: Boolean, default: null },
    creator: Object,
    cover: String,
    topic: String,
    title: String,
    caption: String,
    content: { type: Boolean, default: null },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ name: 'text' });

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema)

export default Document