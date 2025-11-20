"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const recipe_1 = __importDefault(require("../models/recipe"));
const user_1 = __importDefault(require("../models/user")); // User model
const shoppingList_1 = __importDefault(require("../models/shoppingList"));
const auth_1 = __importDefault(require("../middleware/auth"));
const encodeToken_1 = __importDefault(require("../helpers/encodeToken"));
const router = express_1.default.Router();
// get all
router.get('/', auth_1.default, (0, express_validator_1.query)('token').isString(), async (req, res) => {
    const { token } = req.query;
    const { user_id, email } = (0, encodeToken_1.default)(token);
    try {
        const currentUser = await user_1.default.findById(user_id);
        if (!currentUser)
            throw new Error('User not found');
        const shoppingLists = await shoppingList_1.default.find({ author: { $in: [user_id, ...(currentUser.connections || [])] } })
            .sort({ createdAt: 'desc' })
            .limit(20);
        // console.log(shoppingLists)
        const awaitForAuthors = shoppingLists.map(async (list) => {
            const author = await user_1.default.findById(list.author);
            try {
                return { id: (0, uuid_1.v4)(), list, author: author };
            }
            catch (err) {
                return { id: (0, uuid_1.v4)(), list, author: { name: 'Nie wybrany' } };
            }
        });
        const withAuthors = await Promise.all(awaitForAuthors);
        res.status(200).json({ withAuthors });
    }
    catch (err) {
        res.status(500);
        throw new Error('shoppinglist get all fail ');
    }
});
// get single
router.get('/single', (0, express_validator_1.query)('id').isMongoId(), async (req, res) => {
    const { id } = req.query;
    // console.log(req)
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let shoppingList = await shoppingList_1.default.findById(id);
        if (!shoppingList) {
            return res.status(404).send('Shopping list not found');
        }
        const author = await user_1.default.findById(shoppingList.author);
        const recipes = await recipe_1.default.find().where('_id').in(shoppingList.recipes).exec();
        if (shoppingList.ingredients && shoppingList.ingredients.length > 0) {
            shoppingList.ingredients = shoppingList.ingredients.map(ingredient => {
                return {
                    ...ingredient,
                    uuid: (0, uuid_1.v4)()
                };
            });
        }
        res.status(200).json({
            id: shoppingList._id,
            recipes,
            author,
            ingredients: shoppingList.ingredients,
            createdAt: shoppingList.createdAt,
        });
    }
    catch (err) {
        res.status(500);
        throw new Error('get single list fail');
    }
});
// Adding new shopping list
router.post('/add', auth_1.default, (0, express_validator_1.body)('recipes').isArray(), (0, express_validator_1.body)('token').isString(), async (req, res) => {
    const { recipes, token } = req.body;
    const { user_id } = (0, encodeToken_1.default)(token);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (recipes.some((recipe) => recipe.length !== 24)) {
        throw new Error('shoppinglist add - bad recipes id ');
    }
    const awaitForRecipes = recipes.map(async (id) => {
        const recipe = await recipe_1.default.findById(id);
        return recipe;
    });
    const allRecipes = await Promise.all(awaitForRecipes);
    const allIngredients = allRecipes.map((recipe) => recipe.ingredients);
    const allIngredientsArray = [];
    allIngredients.forEach((ingredients) => {
        ingredients.forEach((el) => allIngredientsArray.push(el));
    });
    console.log(allIngredientsArray);
    const result = allIngredientsArray.reduce((acc, { name, qty, unit, id, type }) => {
        const newacc = { ...acc };
        newacc[name] = { name, qty, unit, type, id, value: false };
        newacc[name].qty += acc?.[name]?.qty || 0;
        return newacc;
    }, {});
    console.log('po', result);
    console.log('po2', Object.values(result));
    const shoppingList = new shoppingList_1.default({
        recipes,
        author: user_id,
        ingredients: Object.values(result),
    });
    try {
        const newShoppingList = await shoppingList.save();
        res.status(200).json({ newShoppingList });
    }
    catch (err) {
        res.status(500);
        throw new Error('recipe add error');
    }
});
//Merging two lists together
router.post('/merge', auth_1.default, (0, express_validator_1.body)('recipe1').isString(), (0, express_validator_1.body)('recipe2').isString(), (0, express_validator_1.body)('token').isString(), async (req, res) => {
    const { recipe1, recipe2, token } = req.body;
    const { user_id } = (0, encodeToken_1.default)(token);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const shoppingList1 = await shoppingList_1.default.findById(new mongoose_1.default.Types.ObjectId(recipe1));
    const shoppingList2 = await shoppingList_1.default.findById(new mongoose_1.default.Types.ObjectId(recipe2));
    if (!shoppingList1 || !shoppingList2) {
        return res.status(404).send('Shopping list not found');
    }
    //TODO: set ingredients with value as false, to be unchecked after merging
    const allIngredients1 = shoppingList1.ingredients;
    const allIngredients2 = shoppingList2.ingredients;
    const allRecipes1 = shoppingList1.recipes;
    const allRecipes2 = shoppingList2.recipes;
    // console.log('merg')
    //     console.log('allIngredients1',allIngredients1)
    //     console.log('allIngredients2',allIngredients2)
    const shoppingList = new shoppingList_1.default({
        recipes: [...allRecipes1, ...allRecipes2],
        ingredients: [...allIngredients1, ...allIngredients2],
        author: user_id,
        connected: true,
    });
    try {
        const newShoppingList = await shoppingList.save();
        res.status(200).json({ newShoppingList });
    }
    catch (err) {
        res.status(500);
        throw new Error('recipe add error'); // err was passed as 2nd arg in throw Error, which is invalid in JS/TS usually
    }
});
// Edit shopping list
router.put('/edit', (0, express_validator_1.body)('id').isMongoId(), (0, express_validator_1.body)('recipes').isArray(), (0, express_validator_1.body)('author').isMongoId(), async (req, res) => {
    const { id, recipes, author } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (recipes.some((recipe) => recipe.length !== 24)) {
        throw new Error('shoppinglist add - bad recipes id ');
    }
    try {
        const shoppingList = await shoppingList_1.default.findById(id);
        if (shoppingList) {
            shoppingList.recipes = recipes;
            shoppingList.author = author;
            const editedShoppingList = await shoppingList.save();
            res.status(200).json({ editedShoppingList });
        }
        else {
            res.status(404).send('List not found');
        }
    }
    catch (err) {
        res.status(500);
        throw new Error('recipe add error');
    }
});
// Delete shopping list
router.delete('/delete', (0, express_validator_1.body)('id').isMongoId(), async (req, res) => {
    const { id } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    console.log('run');
    try {
        let shoppingList = await shoppingList_1.default.findById(id);
        if (shoppingList) {
            await shoppingList.deleteOne();
            res.status(200).send('deleted');
        }
        else {
            res.status(404).send('List not found');
        }
    }
    catch (err) {
        res.status(500).send('error');
        throw new Error('shoppingList delete error');
    }
});
//Update shopping list ingredients
router.put('/updateIngredients', (0, express_validator_1.body)('id').isMongoId(), (0, express_validator_1.body)('ingredientName').isString(), (0, express_validator_1.body)('value').isBoolean(), async (req, res) => {
    const { id, ingredientName, value } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const shoppingList = await shoppingList_1.default.findById(id);
        if (!shoppingList)
            return res.status(404).send('List not found');
        const ingredients = shoppingList.ingredients;
        const updatedIngredientIndex = ingredients.findIndex((ingredient) => ingredient.name === ingredientName);
        if (updatedIngredientIndex !== -1) {
            ingredients[updatedIngredientIndex].value = value;
            shoppingList.ingredients = ingredients;
            const updatedShoppingList = await shoppingList.save();
            res.status(200).json({ updatedShoppingList });
        }
        else {
            res.status(404).send('Ingredient not found');
        }
    }
    catch (err) {
        res.status(500);
        throw new Error('shoppingList update error');
    }
});
exports.default = router;
