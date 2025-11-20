"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const authors_1 = __importDefault(require("./routes/authors"));
const shoppingList_1 = __importDefault(require("./routes/shoppingList"));
const ingredients_1 = __importDefault(require("./routes/ingredients"));
const connections_1 = __importDefault(require("./routes/connections"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}
mongoose_1.default.connect(process.env.DATABASE_URL);
console.log(mongoose_1.default.connection.readyState);
const db = mongoose_1.default.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('connected to mongoose'));
app.use('/recipes', recipes_1.default);
app.use('/authors', authors_1.default);
app.use('/shoppinglist', shoppingList_1.default);
app.use('/ingredients', ingredients_1.default);
app.use('/auth', auth_1.default);
app.use('/connections', connections_1.default);
app.get('/', (req, res) => {
    res.send('connect');
    // return 'el' // Express handlers shouldn't return values usually
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
