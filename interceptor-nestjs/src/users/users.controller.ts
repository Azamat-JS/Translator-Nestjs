import {
  Controller,
  Get,
  Param,
} from "@nestjs/common";

const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Alex" },
  { id: 3, name: "Adam" },
];

@Controller("users")
export class UsersController {
  @Get()
  getAll() {
    return users;
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    const foundUser = users.find((user) => user.id === +id);
    if (!foundUser) throw new Error();
    return foundUser;
  }
}
