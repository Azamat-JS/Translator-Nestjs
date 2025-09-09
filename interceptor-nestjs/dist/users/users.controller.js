"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const error_interceptor_1 = require("../interceptors/error/error.interceptor");
const transform_interceptor_1 = require("../interceptors/transform/transform.interceptor");
const users = [
    { id: 1, name: "John" },
    { id: 2, name: "Alex" },
    { id: 3, name: "Adam" },
];
let UsersController = class UsersController {
    getAll() {
        return users;
    }
    async getOne(id) {
        const foundUser = users.find((user) => user.id === +id);
        if (!foundUser)
            throw new Error();
        return foundUser;
    }
    createUser() {
        throw new Error("simple error");
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(transform_interceptor_1.TransformInterceptor),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseInterceptors)(transform_interceptor_1.TransformInterceptor, error_interceptor_1.ErrorInterceptor),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)(error_interceptor_1.ErrorInterceptor),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)("users")
], UsersController);
//# sourceMappingURL=users.controller.js.map