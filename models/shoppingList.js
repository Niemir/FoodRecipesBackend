const mongoose = require('mongoose')

const shoppingListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Author', shoppingListSchema)
