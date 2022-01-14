if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
let { Client, Entity, Schema, Repository } = require('redis-om')
const express = require('express')
const bodyParser = require('body-parser')
const client = new Client()
const cors = require('cors')
const app = express()

app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())

// parse application/json
app.use(bodyParser.json())
async function connect() {
  if (!client.isOpen()) {
    await client.open(
      `redis://${process.env.USERNAME_DB}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.PORT}`,
    )
  }
}

class Recipe extends Entity {}

let schema = new Schema(
  Recipe,
  {
    title: { type: 'string' },
    ingredientsNames: { type: 'array' },
    ingredientsQty: { type: 'array' },
    ingredientsUnits: { type: 'array' },
  },
  {
    dataStructure: 'JSON',
  },
)

async function createRecipe(data) {
  await connect()
  const repository = new Repository(schema, client)

  const recipe = repository.createEntity(data)
  console.log(data)
  const id = await repository.save(recipe)
  return id
}

app.post('/api', async (req, res) => {
  try {
    const id = await createRecipe(req.body)
    res.status(200).json({ id })
  } catch (error) {}
})

app.get('/getRecipes', async (req, res) => {
  await connect()
  const repository = new Repository(schema, client)
  // await repository.createIndex()
  let recipes = await repository.search().return.all()

  console.log(recipes)
  res.json(recipes)
  // res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }) //Line 10
})

app.listen('5000', () => console.log('object'))
