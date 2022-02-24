if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
// const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const recipesRouter = require('./routes/recipes')
const authorsRouter = require('./routes/authors')
const shoppingListRouter = require('./routes/shoppingList')
const mongoose = require('mongoose')

app.use(cors())
// app.use(bodyParser.urlencoded())
// app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to mongoose'))

// app.use('/', indexRouter)
app.use('/recipes', recipesRouter)
app.use('/authors', authorsRouter)
app.use('/shoppinglist', shoppingListRouter)

app.listen('5000', () => console.log('object'))
