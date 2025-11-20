import mongoose, { Document, Schema } from 'mongoose';
import Recipe from './recipe';

export interface IAuthor extends Document {
  name: string;
}

const authorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

authorSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const recipes = await Recipe.find({ author: this.id });
    if (recipes.length > 0) {
      next(new Error('This author has recipes still'));
    } else {
      next();
    }
  } catch (err: any) {
    next(err);
  }
});

export default mongoose.model<IAuthor>('Author', authorSchema);
