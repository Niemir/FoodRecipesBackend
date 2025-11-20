import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email?: string;
  password?: string;
  token?: string;
  connections?: mongoose.Types.ObjectId[];
}

const userSchema = new Schema({
  name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
  connections: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
});

export default mongoose.model<IUser>('User', userSchema);
