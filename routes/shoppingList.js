const express = require('express')
const router = express.Router()
const Recipe = require('../models/recipe')
const Author = require('../models/author')
const ShoppingList = require('../models/shoppingList')
const { body, validationResult } = require('express-validator')

// get all
router.get('/', async (req, res) => {
  try {
    let shoppingLists = await ShoppingList.find().sort({ createdAt: 'desc' })
    res.status(200).json({ shoppingLists })
  } catch {
    res.status(500)
    throw new Error('shoppinglist get all fail ')
  }
})

// get single
router.get('/single', body('id').isMongoId(), async (req, res) => {
  const { id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    let shoppingList = await ShoppingList.findById(id)

    const recipes = await Recipe.find().where('_id').in(shoppingList.recipes).exec()
    const author = await Author.findById(shoppingList.author)
    res.status(200).json({
      id: shoppingList._id,
      recipes,
      author,
    })
  } catch {
    res.status(500)
    throw new Error('shoppinglist get all fail ')
  }
})

// Adding new shopping list
router.post('/add', body('recipes').isArray(), body('author').isMongoId(), async (req, res) => {
  const { recipes, author } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  if (recipes.some((recipe) => recipe.length !== 24)) {
    throw new Error('shoppinglist add - bad recipes id ')
  }

  const shoppingList = new ShoppingList({
    recipes,
    author,
  })

  try {
    const newShoppingList = await shoppingList.save()
    res.status(200).json({ newShoppingList })
  } catch (err) {
    res.status(500)
    throw new Error('recipe add error')
  }
})

// Edit shopping list
router.put('/edit', body('id').isMongoId(), body('recipes').isArray(), body('author').isMongoId(), async (req, res) => {
  const { id, recipes, author } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  if (recipes.some((recipe) => recipe.length !== 24)) {
    throw new Error('shoppinglist add - bad recipes id ')
  }

  try {
    const shoppingList = await ShoppingList.findById(id)
    shoppingList.recipes = recipes
    shoppingList.author = author
    const editedShoppingList = await shoppingList.save()
    res.status(200).json({ editedShoppingList })
  } catch (err) {
    res.status(500)
    throw new Error('recipe add error')
  }
})

// Delete shopping list
router.delete('/delete', body('id').isMongoId(), async (req, res) => {
  const { id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    let shoppingList = await ShoppingList.findById(id)
    await shoppingList.remove()
    res.status(200).send('deleted')
  } catch {
    res.status(500).send('error')
    throw new Error('shoppingList delete error')
  }
})
module.exports = router
