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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCustomClaims = void 0;
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
// Function to set custom claims
exports.setCustomClaims = v2_1.https.onCall(async (request) => {
    const { data, auth } = request;
    // Verify caller is authenticated and admin
    if (!auth) {
        throw new v2_1.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const caller = await admin.auth().getUser(auth.uid);
        const callerClaims = caller.customClaims || {};
        if (!callerClaims.admin) {
            throw new v2_1.https.HttpsError('permission-denied', 'Caller must be an admin');
        }
        // Validate input
        if (!data.uid || !data.claims || !data.claims.role) {
            throw new v2_1.https.HttpsError('invalid-argument', 'Missing required fields');
        }
        await admin.auth().setCustomUserClaims(data.uid, Object.assign(Object.assign({}, data.claims), { timestamp: Date.now() // Force token refresh
         }));
        return { success: true };
    }
    catch (error) {
        console.error('Error setting custom claims:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to set custom claims');
    }
});
//# sourceMappingURL=claims.js.map