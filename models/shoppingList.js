const mongoose = require('mongoose')

const shoppingListSchema = new mongoose.Schema({
  recipes: [
    {
      type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
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
})

module.exports = mongoose.model('ShoppingList', shoppingListSchema)
