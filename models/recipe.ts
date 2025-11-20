import mongoose, { Document, Schema } from 'mongoose';

export interface IRecipe extends Document {
  name: string;
  ingredients: any;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  calories?: number;
  createdAt: Date;
  author: mongoose.Types.ObjectId;
}

const recipeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  ingredients: Schema.Types.Mixed,
  protein: { type: Number },
  carbohydrates: { type: Number },
  fat: { type: Number },
  calories: { type: Number },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Author',
  },
});

export default mongoose.model<IRecipe>('Recipe', recipeSchema);
