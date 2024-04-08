import bcrypt from 'bcrypt';
import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.NEXT_PUBLIC_MONGO_DB_URI);
mongoose.Promise = global.Promise

const documentSchema = new Schema(
  {
    name: String,
    private: Boolean,
    creator_id: String,
    team_id: { type: String, default: null },
    can_edit: { type: Boolean, default: true },
    encrypted_password: { type: String, default: null },
    content: { type: String, default: "" },
    holders_id: { type: Array, default: null },
  },
  {
    timestamps: true,
  }
);

documentSchema.pre('save', async function(next){
  if(this.isModified('encrypted_password')) {
    this.encrypted_password = await bcrypt.hash(this.encrypted_password, 12)
  }
  next()
})

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema)

export default Document