const mongoose = require('mongoose')
const { Schema } = require('redis-om')

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ingredients: mongoose.Schema.Types.Mixed,
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
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Author',
  },
})

module.exports = mongoose.model('Recipe', recipeSchema)
