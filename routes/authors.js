const express = require('express')
const Author = require('../models/author')
const router = express.Router()
const { body, check, validationResult } = require('express-validator')

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

// get single Author
router.get('/single', body('id').isMongoId(), async (req, res) => {
  const { id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    let author = await Author.findById(id)
    res.status(200).json({
      author,
    })
  } catch {
    throw new Error('author get single fail ')
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
