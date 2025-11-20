import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredient extends Document {
  name: string;
  type: string;
}

const ingredientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IIngredient>('Ingredient', ingredientSchema);
