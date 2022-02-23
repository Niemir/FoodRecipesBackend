const express = require('express')
const Author = require('../models/author')
const Recipes = require('../models/recipe')
const { check, validationResult } = require('express-validator')
const router = express.Router()

// All authors route
router.get('/', async (req, res) => {
  //   let searchOptions = {}
  //   if (req.query.name != null && req.query.name !== '') {
  //     searchOptions.name = new RegExp(req.query.name, 'i')
  //   }

  //   try {
  //     console.log(searchOptions)
  //     const authors = await Author.find(searchOptions)
  //     res.json({
  //       authors: authors,
  //       searchOptions: req.query,
  //     })
  //   } catch {
  //     console.log('wut')
  //     res.redirect('/')
  //   }
  res.send('pk')
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
      //   res.send('git autor')
      res.json({
        newAuthor,
      })
      //   res.redirect(`authors/${newAuthor.id}`)
    } catch {
      throw new Error('error author')
    }
  },
)
module.exports = router
