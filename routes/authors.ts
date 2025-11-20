import express, { Request, Response, Router } from 'express';
import Author from '../models/user'; // Preserving original logic: imports User as Author
import { body, validationResult } from 'express-validator';

const router: Router = express.Router();

// All authors route
router.get('/', async (req: Request, res: Response) => {
  try {
    const authors = await Author.find();
    res.json({
      authors: authors,
    });
  } catch (err) {
    res.status(500);
    throw new Error('Error during fetching atuhors');
  }
});

// get single Author
router.get('/single', body('id').isMongoId(), async (req: Request, res: Response) => {
  const { id } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let author = await Author.findById(id);
    res.status(200).json({
      author,
    });
  } catch (err) {
    throw new Error('author get single fail ');
  }
});

export default router;
