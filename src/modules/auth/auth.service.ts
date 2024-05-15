import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/schemas/user.schema';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { UserDto } from "../user/dto/user.dto";

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async generateToken(userId: string): Promise<string> {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
  }

  async loginUser(email: string, password: string): Promise<{ token: string, user: UserDto } | null>  {
    const user = await this.userModel.findOne({ email }).exec();

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await this.generateToken(user._id);
      const userDto = new UserDto(user);
      return { token, user: userDto };
    } else {
      throw new UnauthorizedException('Invalid username or password');
    }
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
