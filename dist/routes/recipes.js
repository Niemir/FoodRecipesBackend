"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const recipe_1 = __importDefault(require("../models/recipe"));
const ingredients_1 = __importDefault(require("../models/ingredients"));
const express_validator_1 = require("express-validator");
const auth_1 = __importDefault(require("../middleware/auth"));
const encodeToken_1 = __importDefault(require("../helpers/encodeToken"));
const router = express_1.default.Router();
// get all recipes
router.get('/', auth_1.default, async (req, res) => {
    let recipes = [];
    try {
        recipes = await recipe_1.default.find().sort({ name: 'asc' });
        res.status(200).json({ recipes });
    }
    catch (err) {
        recipes = [];
        res.status(200).json({ recipes }); // Should probably return empty array if error or handle error
    }
});
// get single recipe
router.get('/single/:id', auth_1.default, async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
        let recipe = await recipe_1.default.findById(id);
        res.status(200).json(recipe);
    }
    catch (err) {
        res.status(500);
        throw new Error('recipe add error');
    }
});
// Adding new recipe
router.post('/add', auth_1.default, (0, express_validator_1.body)('name').isString(), (0, express_validator_1.body)('ingredients').isArray(), (0, express_validator_1.body)('protein').isNumeric(), (0, express_validator_1.body)('carbohydrates').isNumeric(), (0, express_validator_1.body)('fat').isNumeric(), (0, express_validator_1.body)('calories').isNumeric(), async (req, res) => {
    const { name, ingredients, protein, carbohydrates, fat, calories, token } = req.body;
    const { user_id } = (0, encodeToken_1.default)(token);
    console.log(name);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (!name || !token || !ingredients || !protein || !carbohydrates || !fat || !calories) {
        throw new Error('missing parametrs');
    }
    const awaitForIngredients = ingredients.map(async (el) => {
        const ingredient = await ingredients_1.default.findById(el.id);
        console.log(ingredient);
        return { name: el.name, unit: el.unit, qty: el.qty, type: ingredient?.type, _id: new mongoose_1.default.Types.ObjectId(el.id) };
    });
    const allIngredients = await Promise.all(awaitForIngredients);
    const recipe = new recipe_1.default({
        name,
        author: user_id,
        ingredients: allIngredients,
        protein,
        carbohydrates,
        fat,
        calories,
    });
    try {
        const newRecipe = await recipe.save();
        res.status(200).json({ newRecipe });
    }
    catch (err) {
        res.status(500);
        throw new Error(err);
    }
});
router.put('/edit', auth_1.default, (0, express_validator_1.body)('_id').isMongoId(), async (req, res) => {
    console.log(req.body);
    const { _id, name, author, ingredients, protein, carbohydrates, fat, calories } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (!name || !author || !ingredients || !protein || !carbohydrates || !fat || !calories) {
        throw new Error('missing parametrs');
    }
    const awaitForIngredients = ingredients.map(async (el) => {
        const ingredient = await ingredients_1.default.findById(el.id);
        console.log(ingredient);
        return { name: el.name, unit: el.unit, qty: el.qty, type: ingredient?.type, _id: new mongoose_1.default.Types.ObjectId(el.id) };
    });
    const allIngredients = await Promise.all(awaitForIngredients);
    let recipe;
    try {
        recipe = await recipe_1.default.findById(_id);
        if (recipe) {
            recipe.name = name;
            recipe.author = author;
            recipe.ingredients = allIngredients;
            recipe.protein = protein;
            recipe.carbohydrates = carbohydrates;
            recipe.fat = fat;
            recipe.calories = calories;
            const editedRecipe = await recipe.save();
            res.status(200).json({ editedRecipe });
        }
        else {
            res.status(404).send('Recipe not found');
        }
    }
    catch (err) {
        res.status(500);
        throw new Error('recipe edit error');
    }
});
router.delete('/delete', (0, express_validator_1.body)('id').isMongoId(), async (req, res) => {
    const { id } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    let recipe;
    try {
        recipe = await recipe_1.default.findById(id);
        if (recipe) {
            await recipe.deleteOne(); // remove() is deprecated
            res.status(200).send('deleted');
        }
        else {
            res.status(404).send('Recipe not found');
        }
    }
    catch (err) {
        res.status(500);
        throw new Error('recipe edit error');
    }
});
exports.default = router;
