import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/schemas/user.schema';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { UserDto } from "../user/dto/user.dto";
import {Role} from "../permissions/schemas/role.schema";

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private readonly jwtService: JwtService,
  ) {}

  async generateToken(userId: string, permissions: number[]): Promise<string> {
    const payload = {
      userId: userId,
      permissions: permissions
    };
    return this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
  }

  async loginUser(email: string, password: string): Promise<{ token: string, user: UserDto } | null> {
    const user = await this.userModel.findOne({ email }).exec();
    const validPassword = await bcrypt.compare(password, user.password);

    if (!user || !validPassword) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const role = await this.roleModel.findById(user.roleId).exec();
    let permissions: number[] = [];

    if (role) {
      permissions = role.permissions ?? [];
    }

    const token = await this.generateToken(user._id, permissions);
    const userDto = new UserDto(user);
    return { token, user: userDto };
  }

  async registerUser(user: CreateUserDto): Promise<User> {
    const { email } = user;
    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      throw new BadRequestException('Username already exists.');
    }

    const newUser = new User();
    newUser.firstname = user.firstname;
    newUser.lastname = user.lastname;
    newUser.email = user.email;
    newUser.password = await bcrypt.hash(user.password, 10);
    newUser.createdAt = new Date().toISOString();
    newUser.updatedAt = new Date().toISOString();

    return this.userModel.create(newUser);
  }
}
