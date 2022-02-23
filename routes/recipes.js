const express = require('express')
const router = express.Router()
const Recipe = require('../models/recipe')

router.get('/', async (req, res) => {
  let recipes

  try {
    recipes = await Recipe.find().sort({ createAt: 'desc' }).limit(10).exec()
  } catch {
    recipes = []
  }

  console.log(recipes)
})

router.post('/add', async (req, res) => {
  const { name, author, ingredients, protein, carbohydrates, fat, calories } = req.body

  const recipe = new Recipe({
    name,
    author,
    ingredients,
    protein,
    carbohydrates,
    fat,
    calories,
  })

  try {
    const newRecipe = await recipe.save()
    res.json({ newRecipe })
  } catch {
    throw new Error('recipe error')
    // renderNewPage(res, book, true)
  }
})

module.exports = router
