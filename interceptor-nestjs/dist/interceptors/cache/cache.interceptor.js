"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let CacheInterceptor = class CacheInterceptor {
    cache = new Map();
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const key = request.url;
        if (this.cache.has(key)) {
            console.log("Returning cached response.");
            return new rxjs_1.Observable((observer) => {
                observer.next(this.cache.get(key));
                observer.complete();
            });
        }
        return next.handle().pipe((0, rxjs_1.map)((response) => {
            this.cache.set(key, response);
            return response;
        }));
    }
};
exports.CacheInterceptor = CacheInterceptor;
exports.CacheInterceptor = CacheInterceptor = __decorate([
    (0, common_1.Injectable)()
], CacheInterceptor);
//# sourceMappingURL=cache.interceptor.js.map