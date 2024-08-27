import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.MONGO_DB_URI);
mongoose.Promise = global.Promise

const documentSchema = new Schema(
  {
    private: { type: Boolean, default: true },
    locked: { type: Boolean, default: false },
    creator: Object,
    creator_email: String,
    cover: String,
    topic: String,
    title: String,
    caption: String,
    content: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// documentSchema.index({ name: 'text' });

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema)

export default Document