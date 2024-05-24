import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post, Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import * as bcrypt from 'bcryptjs';
import {UpdateUserPasswordDto} from "./dto/update-user-password.dto";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  async createUser(@Body() body: CreateUserDto): Promise<UserDto> {
    if (!body) {
      throw new BadRequestException('User data is required.');
    }

    const existingUser = await this.userService.getUserByEmail(
      body.email,
    );
    if (existingUser) {
      throw new BadRequestException('Username already exists.');
    }

    const user = new User();
    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.password = await bcrypt.hash(user.password, 10);
    user.createdAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    const createdUser = await this.userService.createUser(user);
    return new UserDto(createdUser);
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  async updateUser(@Param('id') id: string, @Body() body: CreateUserDto): Promise<UserDto> {
    if (!body) {
      throw new BadRequestException('User data is required.');
    }

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.updatedAt = new Date().toISOString();

    const updatedUser = await this.userService.updateUser(id, user);
    return new UserDto(updatedUser);
  }

  @UseGuards(AuthGuard)
  @Put('/:id/password')
  @ApiOperation({ summary: 'Change password' })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  async changePassword(@Param('id') id: string, @Body() body: UpdateUserPasswordDto): Promise<User> {
    if (!body) {
      throw new BadRequestException('Password is required.');
    }

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (!await bcrypt.compare(body.currentPassword, user.password)) {
        throw new BadRequestException('Invalid password.');
    }

    user.password = await bcrypt.hash(body.newPassword, 10);
    user.updatedAt = new Date().toISOString();
    return this.userService.updateUser(id, user);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse()
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    const user = await this.userService.getUserById(id);
    return new UserDto(user);
  }
}
