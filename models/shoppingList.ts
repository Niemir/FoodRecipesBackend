import mongoose, { Document, Schema } from 'mongoose';

export interface IShoppingList extends Document {
  recipes: mongoose.Types.ObjectId[];
  createdAt: Date;
  author: mongoose.Types.ObjectId;
  ingredients: {
    name: string;
    qty: number;
    unit: string;
    value: boolean;
  }[];
  connected?: boolean;
}

const shoppingListSchema = new Schema({
  recipes: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Recipe',
    },
  ],
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
  ingredients: [
    {
      name: String,
      qty: Number,
      unit: String,
      value: Boolean,
    },
  ],
  connected: {
    type: Boolean,
  },
});

export default mongoose.model<IShoppingList>('ShoppingList', shoppingListSchema);
