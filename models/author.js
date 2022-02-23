const mongoose = require('mongoose')
const Recipe = require('./recipe')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
})

authorSchema.pre('remove', function (next) {
  Recipe.find({ author: this.id }, (err, recipes) => {
    if (err) {
      next(err)
    } else if (recipes.length > 0) {
      next(new Error('This author has recipes still'))
    } else {
      next()
    }
  })
})
module.exports = mongoose.model('Author', authorSchema)
