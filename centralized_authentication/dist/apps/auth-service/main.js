/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/auth-service/src/auth-service.controller.ts":
/*!**********************************************************!*\
  !*** ./apps/auth-service/src/auth-service.controller.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthServiceController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_service_service_1 = __webpack_require__(/*! ./auth-service.service */ "./apps/auth-service/src/auth-service.service.ts");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
let AuthServiceController = class AuthServiceController {
    authServiceService;
    constructor(authServiceService) {
        this.authServiceService = authServiceService;
    }
    async login(credential) {
        return this.authServiceService.login(credential);
    }
};
exports.AuthServiceController = AuthServiceController;
__decorate([
    (0, microservices_1.MessagePattern)('auth-login'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthServiceController.prototype, "login", null);
exports.AuthServiceController = AuthServiceController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_service_1.AuthServiceService !== "undefined" && auth_service_service_1.AuthServiceService) === "function" ? _a : Object])
], AuthServiceController);


/***/ }),

/***/ "./apps/auth-service/src/auth-service.module.ts":
/*!******************************************************!*\
  !*** ./apps/auth-service/src/auth-service.module.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthServiceModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_service_controller_1 = __webpack_require__(/*! ./auth-service.controller */ "./apps/auth-service/src/auth-service.controller.ts");
const auth_service_service_1 = __webpack_require__(/*! ./auth-service.service */ "./apps/auth-service/src/auth-service.service.ts");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let AuthServiceModule = class AuthServiceModule {
};
exports.AuthServiceModule = AuthServiceModule;
exports.AuthServiceModule = AuthServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: '1d'
                }
            })
        ],
        controllers: [auth_service_controller_1.AuthServiceController],
        providers: [auth_service_service_1.AuthServiceService],
    })
], AuthServiceModule);


/***/ }),

/***/ "./apps/auth-service/src/auth-service.service.ts":
/*!*******************************************************!*\
  !*** ./apps/auth-service/src/auth-service.service.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthServiceService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
let AuthServiceService = class AuthServiceService {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async login(credential) {
        if (credential.username === 'admin' && credential.password === 'password') {
            const payload = { sub: '123', username: credential.username, role: 'admin' };
            const token = this.jwtService.sign(payload);
            return { token };
        }
        throw new common_1.UnauthorizedException('Invalid credentials');
    }
};
exports.AuthServiceService = AuthServiceService;
exports.AuthServiceService = AuthServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object])
], AuthServiceService);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/microservices":
/*!****************************************!*\
  !*** external "@nestjs/microservices" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!***************************************!*\
  !*** ./apps/auth-service/src/main.ts ***!
  \***************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const auth_service_module_1 = __webpack_require__(/*! ./auth-service.module */ "./apps/auth-service/src/auth-service.module.ts");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(auth_service_module_1.AuthServiceModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: "127.0.0.1",
            port: 8877
        }
    });
    await app.listen();
    common_1.Logger.log('Auth service is running on port: 8877');
}
bootstrap();

})();

/******/ })()
;