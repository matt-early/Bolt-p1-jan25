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
exports.verifyAdmin = void 0;
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
// Function to verify admin status
exports.verifyAdmin = v2_1.https.onCall(async (request) => {
    // Verify caller is authenticated
    if (!request.auth) {
        throw new v2_1.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const user = await admin.auth().getUser(request.auth.uid);
        const claims = user.customClaims || {};
        return {
            isAdmin: Boolean(claims.admin),
            role: claims.role || 'team_member'
        };
    }
    catch (error) {
        console.error('Error verifying admin status:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to verify admin status');
    }
});
//# sourceMappingURL=verification.js.map