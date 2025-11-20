import express, { Request, Response, Router } from 'express';
import Ingredient from '../models/ingredients';
import { body, validationResult } from 'express-validator';

const router: Router = express.Router();

// get ingredients by query
router.get('/search', async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (query) {
    try {
      let recipe = await Ingredient.find({ name: { $regex: query, $options: 'i' } }).limit(10);
      res.status(200).json(recipe);
    } catch (err) {
      res.status(500);
      throw new Error('recipe add error');
    }
  } else {
    try {
      let recipe = await Ingredient.find().limit(10);
      res.status(200).json(recipe);
    } catch (err) {
      res.status(500);
      throw new Error('recipe add error');
    }
  }
});

// Adding new recipe (Actually adding ingredient based on logic)
router.post('/add', body('name').isString(), body('type').isString(), async (req: Request, res: Response) => {
  const { name, type } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!name || !type) {
    throw new Error('missing parametrs');
  }

  const ingredient = new Ingredient({
    name,
    type,
  });

  try {
    const newIngredient = await ingredient.save();
    res.status(200).json({ newIngredient });
  } catch (err) {
    res.status(500);
    throw new Error(err as string);
  }
});

export default router;
