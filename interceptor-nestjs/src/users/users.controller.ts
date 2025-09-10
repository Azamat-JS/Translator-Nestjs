import {
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { ErrorInterceptor } from "src/interceptors/error/error.interceptor";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";

const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Alex" },
  { id: 3, name: "Adam" },
];

@Controller("users")
export class UsersController {
  @Get()
  @UseInterceptors(TransformInterceptor)
  getAll() {
    return users;
  }

  @Get(":id")
  @UseInterceptors(TransformInterceptor, ErrorInterceptor)
  async getOne(@Param("id") id: string) {
    const foundUser = users.find((user) => user.id === +id);
    if (!foundUser) throw new Error();
    return foundUser;
  }

  @Post()
  @UseInterceptors(ErrorInterceptor)
  createUser() {
    throw new Error("simple error");
  }
}
