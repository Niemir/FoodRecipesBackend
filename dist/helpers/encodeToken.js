"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dataFromToken = (token) => {
    const decoded = jsonwebtoken_1.default.decode(token, { complete: true });
    if (!decoded || typeof decoded.payload === 'string') {
        throw new Error('Invalid token');
    }
    return decoded.payload;
};
exports.default = dataFromToken;
