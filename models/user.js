const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
  connections: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
})

module.exports = mongoose.model('User', userSchema)
