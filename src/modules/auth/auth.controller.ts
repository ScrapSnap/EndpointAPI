import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDto } from '../user/dto/user.dto';
import { User } from "../user/schemas/user.schema";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user/user.service";
import { RoleService } from "../roles/role.service";

@Controller('auth')
export class AuthController {
  constructor(
      private readonly authService: AuthService,
      private readonly userService: UserService,
      private readonly roleService: RoleService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginUserDto): Promise<{ token: string, user: UserDto }> {
    if (!body) {
      throw new BadRequestException('Username and password are required');
    }

    const { email, password } = body;
    const { token, user } = await this.authService.loginUser(email, password);

    if (!token || !user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return { token, user };
  }

  @Post('register')
  async register(@Body() body: CreateUserDto): Promise<UserDto> {
    if (!body) {
      throw new BadRequestException('User data is required.');
    }

    const existingUser = await this.userService.getUserByEmail(
        body.email,
    );
    if (existingUser) {
      throw new BadRequestException('Username already exists.');
    }

    const defaultRole = await this.roleService.getDefaultRole();
    body.roleId = defaultRole._id;

    let hashed: string = null;
    try {
      hashed = await bcrypt.hash(body.password, 10);
    } catch (error) {
      console.log(error);
    }

    if (!hashed) {
        throw new BadRequestException('Error hashing password');
    }

    const user = new User();
    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.location = body.location;
    user.password = hashed;
    user.createdAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    user.roleId = body.roleId;

    const createdUser = await this.userService.createUser(user);
    return new UserDto(createdUser);
  }
}
