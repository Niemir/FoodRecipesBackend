const express = require('express')
const router = express.Router()
const Recipe = require('../models/recipe')
const Author = require('../models/author')
const ShoppingList = require('../models/shoppingList')
const { body, validationResult, query } = require('express-validator')
const { v4: uuidv4 } = require('uuid')

// get all
router.get('/', async (req, res) => {
  try {
    const shoppingLists = await ShoppingList.find().sort({ createdAt: 'desc' })

    const awaitForAuthors = shoppingLists.map(async (list) => {
      const author = await Author.findById(list.author)

      try {
        return { id: uuidv4(), list, author: author }
      } catch (err) {
        return { id: uuidv4(), list, author: { name: 'Nie wybrany' } }
      }
    })

    const withAuthors = await Promise.all(awaitForAuthors)

    res.status(200).json({ withAuthors })
  } catch {
    res.status(500)
    throw new Error('shoppinglist get all fail ')
  }
})

// get single
router.get('/single', query('id').isMongoId(), async (req, res) => {
  const { id } = req.query
  // console.log(req)

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    let shoppingList = await ShoppingList.findById(id)

    const author = await Author.findById(shoppingList.author)
    const recipes = await Recipe.find().where('_id').in(shoppingList.recipes).exec()

    res.status(200).json({
      id: shoppingList._id,
      recipes,
      author,
      ingredients: shoppingList.ingredients,
      createdAt: shoppingList.createdAt,
    })
  } catch {
    res.status(500)
    throw new Error('get single list fail')
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

  const awaitForRecipes = recipes.map(async (id) => {
    const recipe = await Recipe.findById(id)

    return recipe
  })

  const allRecipes = await Promise.all(awaitForRecipes)
  const allIngredients = allRecipes.map((recipe) => recipe.ingredients)
  const allIngredientsArray = []
  allIngredients.forEach((ingredients) => {
    ingredients.forEach((el) => allIngredientsArray.push(el))
  })

  const result = allIngredientsArray.reduce((acc, { name, qty, unit }) => {
    acc[name] = { name, qty, unit, value: false }
    acc[name].qty += qty
    return acc
  }, {})

  const shoppingList = new ShoppingList({
    recipes,
    author,
    ingredients: Object.values(result),
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
  console.log('run')
  try {
    let shoppingList = await ShoppingList.findById(id)
    await shoppingList.remove()
    res.status(200).send('deleted')
  } catch {
    res.status(500).send('error')
    throw new Error('shoppingList delete error')
  }
})

//Update shopping list ingredients
router.put(
  '/updateIngredients',
  body('id').isMongoId(),
  body('ingredientName').isString(),
  body('value').isBoolean(),
  async (req, res) => {
    const { id, ingredientName, value } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const shoppingList = await ShoppingList.findById(id)
      const ingredients = shoppingList.ingredients
      const updatedIngredientIndex = ingredients.findIndex((ingredient) => ingredient.name === ingredientName)
      ingredients[updatedIngredientIndex].value = value

      shoppingList.ingredients = ingredients
      const updatedShoppingList = await shoppingList.save()
      res.status(200).json({ updatedShoppingList })
    } catch {
      res.status(500)
      throw new Error('shoppingList update error')
    }
  },
)
module.exports = router
