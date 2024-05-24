import {
  BadRequestException,
  Body,
  Controller,
  Get, InternalServerErrorException, NotFoundException,
  Param,
  Post, Put,
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
import { UpdateUserPasswordDto } from "./dto/update-user-password.dto";
import { Permission } from "../roles/enums/permissions.enum";
import { Permissions } from '../roles/enums/permissions.decorator';
import { PermissionsGuard } from "../permissions/permission.guard";

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permissions(Permission.WRITE_USERS)
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

  @Get()
  @Permissions(Permission.READ_USERS)
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ type: [UserDto] })
  @ApiNotFoundResponse()
  async getUsers(): Promise<UserDto[]> {
    const users = await this.userService.getUsers();
    return users.map((user) => new UserDto(user));
  }
}
