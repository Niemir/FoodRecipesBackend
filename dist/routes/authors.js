"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user")); // Preserving original logic: imports User as Author
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// All authors route
router.get('/', async (req, res) => {
    try {
        const authors = await user_1.default.find();
        res.json({
            authors: authors,
        });
    }
    catch (err) {
        res.status(500);
        throw new Error('Error during fetching atuhors');
    }
});
// get single Author
router.get('/single', (0, express_validator_1.body)('id').isMongoId(), async (req, res) => {
    const { id } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let author = await user_1.default.findById(id);
        res.status(200).json({
            author,
        });
    }
    catch (err) {
        throw new Error('author get single fail ');
    }
});
exports.default = router;
