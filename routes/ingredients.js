const express = require('express')
const router = express.Router()
const Ingredient = require('../models/ingredients')
const { body, validationResult } = require('express-validator')

// get all recipes
// router.get('/', async (req, res) => {
//   let recipes

//   try {
//     recipes = await Recipe.find().sort({ name: 'asc' })
//     res.status(200).json({ recipes })
//   } catch {
//     recipes = []
//   }
// })

// get ingredients by query
router.get('/search', async (req, res) => {
  const query = req.query.q

  if (query) {
    try {
      let recipe = await Ingredient.find({ name: { $regex: query, $options: 'i' } })
      res.status(200).json(recipe)
    } catch {
      res.status(500)
      throw new Error('recipe add error')
    }
  } else {
    try {
      let recipe = await Ingredient.find().limit(5)
      res.status(200).json(recipe)
    } catch {
      res.status(500)
      throw new Error('recipe add error')
    }
  }
})

// Adding new recipe
router.post('/add', body('name').isString(), body('type').isString(), async (req, res) => {
  const { name, type } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  if (!name || !type) {
    throw new Error('missing parametrs')
  }

  const ingredient = new Ingredient({
    name,
    type,
  })

  try {
    const newIngredient = await ingredient.save()
    res.status(200).json({ newIngredient })
  } catch (err) {
    res.status(500)
    throw new Error(err)
  }
})

module.exports = router
