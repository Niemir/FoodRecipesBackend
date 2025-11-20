"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const router = express_1.default.Router();
router.post('/login', (0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('password').isString(), async (req, res) => {
    // Our login logic starts here
    try {
        // Get user input
        const { email, password } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Validate if user exist in our database
        const user = await user_1.default.findOne({ email });
        console.log('fsd2');
        if (!user) {
            return res.status(400).json({ errors: 'user not found' });
        }
        if (user && user.password && (await bcryptjs_1.default.compare(password, user.password))) {
            // Create token
            const token = jsonwebtoken_1.default.sign({ user_id: user._id, email }, process.env.TOKEN_KEY || 'default_key', {
                expiresIn: '24h',
            });
            // save user token
            user.token = token;
            // user
            res.status(200).json(user);
        }
        else {
            res.status(400).send('Nieprawidłowe dane');
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});
// Create author
router.post('/register', (0, express_validator_1.body)('name').isString(), (0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('password').isString(), async (req, res) => {
    console.log('f');
    const { name, email, password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).send('User Already Exist. Please Login');
        }
        const encryptedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await user_1.default.create({
            name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
            connections: [],
        });
        // Create token
        const token = jsonwebtoken_1.default.sign({ user_id: user._id, email }, process.env.TOKEN_KEY || 'default_key', {
            expiresIn: '24h',
        });
        // save user token
        user.token = token;
        // return new user
        res.status(201).json(user);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});
exports.default = router;
