"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.verifyAdmin = exports.setCustomClaims = void 0;
const app_1 = require("firebase-admin/app");
const claims_1 = require("./auth/claims");
Object.defineProperty(exports, "setCustomClaims", { enumerable: true, get: function () { return claims_1.setCustomClaims; } });
const verification_1 = require("./auth/verification");
Object.defineProperty(exports, "verifyAdmin", { enumerable: true, get: function () { return verification_1.verifyAdmin; } });
const admin_1 = require("./auth/admin");
Object.defineProperty(exports, "createUser", { enumerable: true, get: function () { return admin_1.createUser; } });
(0, app_1.initializeApp)();
//# sourceMappingURL=index.js.map