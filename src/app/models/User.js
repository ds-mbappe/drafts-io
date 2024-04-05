import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.NEXT_PUBLIC_MONGO_DB_URI);
mongoose.Promise = global.Promise

const userSchema = new Schema(
  {
    id: String,
    firstname: String,
    lastname: String,
    email: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User