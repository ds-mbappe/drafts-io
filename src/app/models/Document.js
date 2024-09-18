import mongoose, { Schema } from "mongoose";

mongoose.connect(process?.env?.VERCEL_ENV === 'production' ? String(process.env.MONGO_DB_URI_PROD) : String(process.env.MONGO_DB_URI_DEV));
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
    character_count: Number,
    word_count: Number,
    content: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ title: "text" }, { name: "titleIndex" });

// console.log(documentSchema.indexes())

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema)

export default Document