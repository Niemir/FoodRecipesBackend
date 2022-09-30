const express = require('express')
const router = express.Router()
const Recipe = require('../models/recipe')
const Author = require('../models/user')
const ShoppingList = require('../models/shoppingList')
const { body, validationResult, query } = require('express-validator')
const { v4: uuidv4 } = require('uuid')
const auth = require('../middleware/auth')
const dataFromToken = require('../helpers/encodeToken')
const { default: mongoose } = require('mongoose')

// get all
router.get('/', auth, query('token').isString(), async (req, res) => {
  const { token } = req.query

  const { user_id, email } = dataFromToken(token)

  try {
    const currentUser = await Author.findById(user_id)
    const shoppingLists = await ShoppingList.find({ author: { $in: [user_id, ...currentUser.connections] } })
      .sort({ createdAt: 'desc' })
      .limit(20)

    // console.log(shoppingLists)
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
  } catch (err) {
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


    if(shoppingList.ingredients && shoppingList.ingredients.length > 0){
      shoppingList.ingredients = shoppingList.ingredients.map(ingredient => {
        return {
          ...ingredient,
          uuid: uuidv4()
        }
      }
      )

    }
    res.status(200).json({
      id: shoppingList._id,
      recipes,
      author,
      ingredients: shoppingList.ingredients,
      createdAt: shoppingList.createdAt,
    })
  } catch (err) {
    res.status(500)
    throw new Error('get single list fail')
  }
})

// Adding new shopping list
router.post('/add', auth, body('recipes').isArray(), body('token').isString(), async (req, res) => {
  const { recipes, token } = req.body

  const { user_id } = dataFromToken(token)

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

  console.log(allIngredientsArray)


  const result = allIngredientsArray.reduce((acc, { name,  qty, unit, id, type }) => {

    const newacc = {...acc}
    newacc[name] = { name, qty, unit,  type, id, value: false }
    newacc[name].qty += acc?.[name]?.qty || 0
    return newacc

  }, {})

  console.log('po', result)
  console.log('po2', Object.values(result))



  const shoppingList = new ShoppingList({
    recipes,
    author: user_id,
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

//Merging two lists together
router.post(
  '/merge',
  auth,
  body('recipe1').isString(),
  body('recipe2').isString(),
  body('token').isString(),
  async (req, res) => {
    const { recipe1, recipe2, token } = req.body

    const { user_id } = dataFromToken(token)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const shoppingList1 = await ShoppingList.findById(mongoose.Types.ObjectId(recipe1))
    const shoppingList2 = await ShoppingList.findById(mongoose.Types.ObjectId(recipe2))

    //TODO: set ingredients with value as false, to be unchecked after merging
    const allIngredients1 = shoppingList1.ingredients
    const allIngredients2 = shoppingList2.ingredients
    const allRecipes1 = shoppingList1.recipes
    const allRecipes2 = shoppingList2.recipes
// console.log('merg')
//     console.log('allIngredients1',allIngredients1)
//     console.log('allIngredients2',allIngredients2)

    const shoppingList = new ShoppingList({
      recipes: [...allRecipes1, ...allRecipes2],
      ingredients: [...allIngredients1, ...allIngredients2],
      author: user_id,
      connected: true,
    })

    try {
      const newShoppingList = await shoppingList.save()
      res.status(200).json({ newShoppingList })
    } catch (err) {
      res.status(500)
      throw new Error('recipe add error', err)
    }
  },
)

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
  } catch (err) {
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
    } catch (err) {
      res.status(500)
      throw new Error('shoppingList update error')
    }
  },
)
module.exports = router
