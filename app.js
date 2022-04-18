require('dotenv').config()
const express = require('express')
// const bodyParser = require('body-parser')
const cors = require('cors')
const recipesRouter = require('./routes/recipes')
const authorsRouter = require('./routes/authors')
const shoppingListRouter = require('./routes/shoppingList')
const ingredientsRouter = require('./routes/ingredients')
const authRouter = require('./routes/auth')
const mongoose = require('mongoose')
const app = express()

app.use(cors())
// app.use(bodyParser.urlencoded())
// app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoose.connect(
  process.env.DATABASE_URL,
  // ,
  //     {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useCreateIndex: true,
  //   useFindAndModify: false,
  // }
)
console.log(mongoose.connection.readyState)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to mongoose'))

// app.use('/', indexRouter)
app.use('/recipes', recipesRouter)
app.use('/authors', authorsRouter)
app.use('/shoppinglist', shoppingListRouter)
app.use('/ingredients', ingredientsRouter)
app.use('/auth', authRouter)

app.listen('5000', () => console.log('object'))
