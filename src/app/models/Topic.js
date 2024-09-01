import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.MONGO_DB_URI);
mongoose.Promise = global.Promise

const topicSchema = new Schema(
  {
    value: {
      type: String,
    },
    title: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema)

export default Topic