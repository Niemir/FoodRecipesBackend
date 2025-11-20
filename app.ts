import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import recipesRouter from './routes/recipes';
import authorsRouter from './routes/authors';
import shoppingListRouter from './routes/shoppingList';
import ingredientsRouter from './routes/ingredients';
import connectionsRouter from './routes/connections';
import authRouter from './routes/auth';

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

mongoose.connect(process.env.DATABASE_URL);

console.log(mongoose.connection.readyState);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('connected to mongoose'));

app.use('/recipes', recipesRouter);
app.use('/authors', authorsRouter);
app.use('/shoppinglist', shoppingListRouter);
app.use('/ingredients', ingredientsRouter);
app.use('/auth', authRouter);
app.use('/connections', connectionsRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('connect');
  // return 'el' // Express handlers shouldn't return values usually
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
