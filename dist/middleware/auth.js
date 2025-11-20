"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send('Wymagany token do autoryzacji');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY || '');
        req.user = decoded;
    }
    catch (err) {
        return res.status(401).send('Nieprawidłowy token');
    }
    return next();
};
exports.default = verifyToken;
