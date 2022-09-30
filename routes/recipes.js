const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Recipe = require('../models/recipe')
const Ingredient = require('../models/ingredients')
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const dataFromToken = require('../helpers/encodeToken')
// get all recipes
router.get('/', auth, async (req, res) => {
  let recipes

  try {
    recipes = await Recipe.find().sort({ name: 'asc' })
    res.status(200).json({ recipes })
  } catch (err) {
    recipes = []
  }
})

// get single recipe
router.get('/single/:id', auth, async (req, res) => {
  const id = req.params.id

  console.log(id)
  try {
    let recipe = await Recipe.findById(id)
    res.status(200).json(recipe)
  } catch (err) {
    res.status(500)
    throw new Error('recipe add error')
  }
})

// Adding new recipe
router.post(
  '/add',
  auth,
  body('name').isString(),
  body('ingredients').isArray(),
  body('protein').isNumeric(),
  body('carbohydrates').isNumeric(),
  body('fat').isNumeric(),
  body('calories').isNumeric(),
  async (req, res) => {
    const { name, ingredients, protein, carbohydrates, fat, calories, token } = req.body
    const { user_id } = dataFromToken(token)

    console.log(name)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    if (!name || !token || !ingredients || !protein || !carbohydrates || !fat || !calories) {
      throw new Error('missing parametrs')
    }

    const awaitForIngredients = ingredients.map(async (el) => {
      const ingredient = await Ingredient.findById(el.id)

      console.log(ingredient)
      return { name: el.name, unit: el.unit, qty: el.qty, type: ingredient.type, _id: mongoose.Types.ObjectId(el.id)  }
    })

    const allIngredients = await Promise.all(awaitForIngredients)

    const recipe = new Recipe({
      name,
      author: user_id,
      ingredients: allIngredients,
      protein,
      carbohydrates,
      fat,
      calories,
    })

    try {
      const newRecipe = await recipe.save()
      res.status(200).json({ newRecipe })
    } catch (err) {
      res.status(500)
      throw new Error(err)
    }
  },
)

router.put('/edit', auth, body('_id').isMongoId(), async (req, res) => {
  console.log(req.body)
  const { _id, name, author, ingredients, protein, carbohydrates, fat, calories } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  if (!name || !author || !ingredients || !protein || !carbohydrates || !fat || !calories) {
    throw new Error('missing parametrs')
  }

  const awaitForIngredients = ingredients.map(async (el) => {
    const ingredient = await Ingredient.findById(el.id)

    console.log(ingredient)
    return { name: el.name, unit: el.unit, qty: el.qty, type: ingredient.type, _id: mongoose.Types.ObjectId(el.id) }
  })

  const allIngredients = await Promise.all(awaitForIngredients)

  let recipe
  try {
    recipe = await Recipe.findById(_id)
    recipe.name = name
    recipe.author = author
    recipe.ingredients = allIngredients
    recipe.protein = protein
    recipe.carbohydrates = carbohydrates
    recipe.fat = fat
    recipe.calories = calories

    const editedRecipe = await recipe.save()
    res.status(200).json({ editedRecipe })
  } catch (err) {
    res.status(500)
    throw new Error('recipe edit error')
  }
})

router.delete('/delete', body('id').isMongoId(), async (req, res) => {
  const { id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  let recipe
  try {
    recipe = await Recipe.findById(id)
    await recipe.remove()
    res.status(200)
  } catch (err) {
    res.status(500)
    throw new Error('recipe edit error')
  }
})

module.exports = router
