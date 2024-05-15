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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginUserDto): Promise<{ token: string }> {
    if (!body) {
      throw new BadRequestException('Username and password are required');
    }

    const { email, password } = body;
    const token = await this.authService.loginUser(email, password);

    if (!token) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return { token };
  }

  @Post('register')
  async register(@Body() body: CreateUserDto): Promise<UserDto> {
    if (!body) {
      throw new BadRequestException('Username and password are required');
    }

    const createdUser =  await this.authService.registerUser(body);
    return new UserDto(createdUser);
  }
}
