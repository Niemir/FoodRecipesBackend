"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ingredients_1 = __importDefault(require("../models/ingredients"));
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// get ingredients by query
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (query) {
        try {
            let recipe = await ingredients_1.default.find({ name: { $regex: query, $options: 'i' } }).limit(10);
            res.status(200).json(recipe);
        }
        catch (err) {
            res.status(500);
            throw new Error('recipe add error');
        }
    }
    else {
        try {
            let recipe = await ingredients_1.default.find().limit(10);
            res.status(200).json(recipe);
        }
        catch (err) {
            res.status(500);
            throw new Error('recipe add error');
        }
    }
});
// Adding new recipe (Actually adding ingredient based on logic)
router.post('/add', (0, express_validator_1.body)('name').isString(), (0, express_validator_1.body)('type').isString(), async (req, res) => {
    const { name, type } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (!name || !type) {
        throw new Error('missing parametrs');
    }
    const ingredient = new ingredients_1.default({
        name,
        type,
    });
    try {
        const newIngredient = await ingredient.save();
        res.status(200).json({ newIngredient });
    }
    catch (err) {
        res.status(500);
        throw new Error(err);
    }
});
exports.default = router;
