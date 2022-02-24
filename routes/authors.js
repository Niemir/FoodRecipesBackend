const express = require('express')
const Author = require('../models/author')
const Recipes = require('../models/recipe')
const { check, validationResult } = require('express-validator')
const router = express.Router()

// All authors route
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find()
    res.json({
      authors: authors,
    })
  } catch {
    res.status(500)
    throw new Error('Error during fetching atuhors')
  }
})

// Create author
router.post(
  '/',
  check('name')
    .exists()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 chars long')
    .isLength({ max: 20 })
    .withMessage('Name must be maximum 20 chars long'),
  async (req, res) => {
    const errors = validationResult(req)

    const author = new Author({
      name: req.body.name,
    })

    if (!errors.isEmpty()) {
      throw new Error('empty')
    }

    try {
      const newAuthor = await author.save()
      res.json({
        newAuthor,
      })
    } catch {
      throw new Error('error author')
    }
  },
)
module.exports = router
