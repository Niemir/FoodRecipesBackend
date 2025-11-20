import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import User from '../models/user';

const router: Router = express.Router();

router.post('/login', body('email').isEmail(), body('password').isString(), async (req: Request, res: Response) => {
  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Validate if user exist in our database
    const user = await User.findOne({ email });
    console.log('fsd2');
    if (!user) {
      return res.status(400).json({ errors: 'user not found' });
    }
    if (user && user.password && (await bcryptjs.compare(password, user.password))) {
      // Create token
      const token = jsonwebtoken.sign({ user_id: user._id, email }, process.env.TOKEN_KEY || 'default_key', {
        expiresIn: '24h',
      });

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    } else {
      res.status(400).send('Nieprawidłowe dane');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

// Create author
router.post(
  '/register',
  body('name').isString(),
  body('email').isEmail(),
  body('password').isString(),
  async (req: Request, res: Response) => {
    console.log('f');
    const { name, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).send('User Already Exist. Please Login');
      }

      const encryptedPassword = await bcryptjs.hash(password, 10);

      const user = await User.create({
        name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
        connections: [],
      });

      // Create token
      const token = jsonwebtoken.sign({ user_id: user._id, email }, process.env.TOKEN_KEY || 'default_key', {
        expiresIn: '24h',
      });
      // save user token
      user.token = token;

      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
    }
  },
);

export default router;
