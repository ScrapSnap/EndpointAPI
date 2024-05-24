import {
  BadRequestException,
  Body,
  Controller,
  Get, InternalServerErrorException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import * as bcrypt from 'bcryptjs';

@Controller('users')
@ApiBearerAuth()
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
  @Get('/:id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse()
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    const user = await this.userService.getUserById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found.');
    }

    return new UserDto(user);
  }
}
