import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/schemas/user.schema';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';

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

  async loginUser(username: string, password: string): Promise<string | null> {
    const user = await this.userModel.findOne({ username }).exec();

    if (user && (await bcrypt.compare(password, user.password))) {
      return this.generateToken(user._id);
    }

    return null;
  }

  async registerUser(user: CreateUserDto): Promise<User> {
    const { username } = user;
    const existingUser = await this.userModel.findOne({ username }).exec();

    if (existingUser) {
      throw new BadRequestException('Username already exists.');
    }

    const newUser = new User();
    newUser.firstname = user.firstname;
    newUser.lastname = user.lastname;
    newUser.username = user.username;
    newUser.password = await bcrypt.hash(user.password, 10);
    newUser.createdAt = new Date().toISOString();
    newUser.updatedAt = new Date().toISOString();

    return this.userModel.create(newUser);
  }
}
