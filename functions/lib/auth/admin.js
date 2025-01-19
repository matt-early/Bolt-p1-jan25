"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});
exports.createUser = v2_1.https.onRequest(async (req, res) => {
    // Handle CORS
    await new Promise((resolve) => corsHandler(req, res, resolve));
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const data = req.body;
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
        res.status(401).send('Unauthorized');
        return;
    }
    try {
        // Verify caller's token and admin status
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const callerClaims = (await admin.auth().getUser(decodedToken.uid)).customClaims;
        if (!(callerClaims === null || callerClaims === void 0 ? void 0 : callerClaims.admin)) {
            res.status(403).send('Forbidden - Admin access required');
            return;
        }
        // Validate region for regional managers
        if (data.role === "regional" && !data.regionId) {
            res.status(400).json({
                error: "Region ID is required for regional managers"
            });
            return;
        }
        // Verify region exists
        if (data.role === "regional") {
            const regionDoc = await admin.firestore()
                .collection("regions")
                .doc(data.regionId)
                .get();
            if (!regionDoc.exists) {
                res.status(400).json({
                    error: "Invalid region ID"
                });
                return;
            }
        }
        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            emailVerified: true,
            displayName: data.name
        });
        // Set custom claims
        await admin.auth().setCustomUserClaims(userRecord.uid, {
            role: data.role,
            admin: data.role === "admin",
            timestamp: Date.now()
        });
        // Create user profile in Firestore
        await admin.firestore().collection("users").doc(userRecord.uid).set({
            email: data.email,
            name: data.name,
            role: data.role,
            staffCode: data.staffCode,
            regionId: data.regionId,
            approved: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        const response = { uid: userRecord.uid };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error creating user:", {
            error,
            email: data.email,
            role: data.role,
            regionId: data.regionId
        });
        if (error.code === 'auth/email-already-exists') {
            res.status(400).json({
                error: "Email already exists"
            });
            return;
        }
        res.status(500).json({
            error: "Failed to create user",
            details: error.message
        });
    }
});
//# sourceMappingURL=admin.js.map