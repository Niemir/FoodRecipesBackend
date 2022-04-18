const express = require('express')
const router = express.Router()
const Recipe = require('../models/recipe')
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
// get all recipes
router.get('/', auth, async (req, res) => {
  let recipes

  try {
    recipes = await Recipe.find().sort({ name: 'asc' })
    res.status(200).json({ recipes })
  } catch {
    recipes = []
  }
})

// get single recipe
router.get('/single/:id', auth, async (req, res) => {
  const id = req.params.id
  try {
    let recipe = await Recipe.findById(id)
    res.status(200).json(recipe)
  } catch {
    res.status(500)
    throw new Error('recipe add error')
  }
})

// Adding new recipe
router.post(
  '/add',
  body('name').isString(),
  body('author').isMongoId(),
  body('ingredients').isArray(),
  body('protein').isNumeric(),
  body('carbohydrates').isNumeric(),
  body('fat').isNumeric(),
  body('calories').isNumeric(),
  async (req, res) => {
    const { name, author, ingredients, protein, carbohydrates, fat, calories } = req.body

    console.log(name)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    if (!name || !author || !ingredients || !protein || !carbohydrates || !fat || !calories) {
      throw new Error('missing parametrs')
    }

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
      res.status(200).json({ newRecipe })
    } catch (err) {
      res.status(500)
      throw new Error(err)
    }
  },
)

router.put('/edit', body('_id').isMongoId(), async (req, res) => {
  const { _id, name, author, ingredients, protein, carbohydrates, fat, calories } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  if (!name || !author || !ingredients || !protein || !carbohydrates || !fat || !calories) {
    throw new Error('missing parametrs')
  }

  let recipe

  try {
    recipe = await Recipe.findById(_id)
    recipe.name = name
    recipe.author = author
    recipe.ingredients = ingredients
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
  } catch {
    res.status(500)
    throw new Error('recipe edit error')
  }
})

module.exports = router
