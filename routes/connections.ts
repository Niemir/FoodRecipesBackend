import express, { Request, Response, Router } from 'express';
import Author from '../models/user'; // Preserving logic: imports User as Author
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth';
import dataFromToken from '../helpers/encodeToken';

const router: Router = express.Router();

// Add connection with new friend
router.post('/', auth, body('friendID').isString(), body('token').isString(), async (req: Request, res: Response) => {
  const { friendID, token } = req.body;
  const { user_id } = dataFromToken(token);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let currentUser = await Author.findById(user_id);
    let friend = await Author.findById(friendID);

    if (!currentUser || !friend) {
      throw new Error('User not found');
    }

    // Ensure connections is initialized
    if (!currentUser.connections) currentUser.connections = [];
    if (!friend.connections) friend.connections = [];

    if (!currentUser.connections.includes(friendID)) {
      currentUser.connections = [...currentUser.connections, friendID];
    }
    if (!friend.connections.includes(user_id)) {
      friend.connections = [...friend.connections, user_id];
    }

    const editedUser = await currentUser.save();
    const editedFriend = await friend.save();

    res.status(200).json({ user: editedUser });
  } catch (err) {
    res.status(500);
    throw new Error('Connection add error');
  }
});

// Remove connection with friend
router.delete('/', auth, body('friendID').isMongoId(), body('token').isString(), async (req: Request, res: Response) => {
  const { friendID, token } = req.body;
  const { user_id } = dataFromToken(token);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let currentUser = await Author.findById(user_id);
    let friend = await Author.findById(friendID);

    if (!currentUser || !friend) {
      throw new Error('User not found');
    }
    if (!Array.isArray(currentUser.connections) || !Array.isArray(friend.connections)) { // Fixed typo in original: currentUser.connections repeated
      throw new Error('User has no connections');
    }

    if (currentUser.connections.includes(friendID)) {
      currentUser.connections = currentUser.connections.filter((id) => id.toString() !== friendID.toString());
    }
    if (friend.connections.includes(user_id)) {
      friend.connections = friend.connections.filter((id) => id.toString() !== user_id.toString());
    }

    const editedUser = await currentUser.save();
    const editedFriend = await friend.save();

    res.status(200).json({ user: editedUser });
  } catch (err) {
    res.status(500);
    throw new Error('Connection remove error');
  }
});

export default router;
