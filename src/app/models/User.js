import mongoose, { Schema } from "mongoose";

mongoose.connect(process?.env?.VERCEL_ENV === 'production' ? String(process.env.MONGO_DB_URI_PROD) : String(process.env.MONGO_DB_URI_DEV));
mongoose.Promise = global.Promise

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      unique: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    firstname: {
      type: String,
      required: false,
    },
    lastname: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
    },
    draftContent: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: false,
    },
    lang: {
      type: String,
      default: "en",
    },
    draft: {
      type: String,
      default: "",
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User