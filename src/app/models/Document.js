import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.NEXT_PUBLIC_MONGO_DB_URI);
mongoose.Promise = global.Promise

const documentSchema = new Schema(
  {
    title: String,
    private: Boolean,
    team_id: String,
    can_edit: Boolean,
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema)

export default Document