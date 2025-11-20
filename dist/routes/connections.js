"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user")); // Preserving logic: imports User as Author
const express_validator_1 = require("express-validator");
const auth_1 = __importDefault(require("../middleware/auth"));
const encodeToken_1 = __importDefault(require("../helpers/encodeToken"));
const router = express_1.default.Router();
// Add connection with new friend
router.post('/', auth_1.default, (0, express_validator_1.body)('friendID').isString(), (0, express_validator_1.body)('token').isString(), async (req, res) => {
    const { friendID, token } = req.body;
    const { user_id } = (0, encodeToken_1.default)(token);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let currentUser = await user_1.default.findById(user_id);
        let friend = await user_1.default.findById(friendID);
        if (!currentUser || !friend) {
            throw new Error('User not found');
        }
        // Ensure connections is initialized
        if (!currentUser.connections)
            currentUser.connections = [];
        if (!friend.connections)
            friend.connections = [];
        if (!currentUser.connections.includes(friendID)) {
            currentUser.connections = [...currentUser.connections, friendID];
        }
        if (!friend.connections.includes(user_id)) {
            friend.connections = [...friend.connections, user_id];
        }
        const editedUser = await currentUser.save();
        const editedFriend = await friend.save();
        res.status(200).json({ user: editedUser });
    }
    catch (err) {
        res.status(500);
        throw new Error('Connection add error');
    }
});
// Remove connection with friend
router.delete('/', auth_1.default, (0, express_validator_1.body)('friendID').isMongoId(), (0, express_validator_1.body)('token').isString(), async (req, res) => {
    const { friendID, token } = req.body;
    const { user_id } = (0, encodeToken_1.default)(token);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let currentUser = await user_1.default.findById(user_id);
        let friend = await user_1.default.findById(friendID);
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
    }
    catch (err) {
        res.status(500);
        throw new Error('Connection remove error');
    }
});
exports.default = router;
