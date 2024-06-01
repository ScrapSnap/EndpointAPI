import {
  BadRequestException,
  Body,
  Controller, Delete,
  Get, InternalServerErrorException, NotFoundException,
  Param,
  Post, Put, Req, UnauthorizedException,
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
import { RoleService } from "../roles/role.service";
import { Request } from "express";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
      private readonly userService: UserService,
      private readonly roleService: RoleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  async createUser(@Req() request: Request, @Body() body: CreateUserDto): Promise<UserDto> {
    if (!body) {
      throw new BadRequestException('User data is required.');
    }

    const existingUser = await this.userService.getUserByEmail(
      body.email,
    );
    if (existingUser) {
      throw new BadRequestException('Username already exists.');
    }

    // If role is present, check permission, else assign default 'User' role
    if (body.roleId && body.roleId !== '') {
      const userId = request['user'].userId;
      const hasPermission = await this.roleService.hasPermission(userId, Permission.WRITE_USERS);
      if (!hasPermission) {
        throw new UnauthorizedException('You do not have permission to assign roles.');
      }
    } else {
      const defaultRole = await this.roleService.getDefaultRole();
      body.roleId = defaultRole._id;
    }

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

  @Put('/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  async updateUser(@Req() request: Request, @Param('id') id: string, @Body() body: UpdateUserDto): Promise<UserDto> {
    if (!body) {
      throw new BadRequestException('User data is required.');
    }

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    // Check permissions if current user is not updating their own profile
    const userId = request['user'].userId;
    if (userId !== id) {
        const hasPermission = await this.roleService.hasPermission(userId, Permission.WRITE_USERS);
        if (!hasPermission) {
            throw new UnauthorizedException('You do not have permission to update this user.');
        }
    }

    if (body.password && body.password !== '') {
        const hashed = await bcrypt.hash(body.password, 10);
        if (!hashed) {
            throw new BadRequestException('Error hashing password');
        }

        user.password = hashed;
    }

    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.location = body.location;
    user.updatedAt = new Date().toISOString();

    const updatedUser = await this.userService.updateUser(id, user);
    return new UserDto(updatedUser);
  }

  @Delete('/:id')
  @Permissions(Permission.DELETE_USERS)
  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  async deleteUser(@Param('id') id: string): Promise<boolean> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.userService.deleteUser(id);
    return true;
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
