import { Injectable } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { getAllPermissions } from "../roles/enums/permissions.enum";
import { Role } from "../roles/schemas/role.schema";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
      @InjectModel(User.name) private userModel: Model<User>,
      @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async createUser(user: User): Promise<User> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async updateUser(id: string, user: User): Promise<User | null> {
    await this.userModel.findByIdAndUpdate(id, user).exec();
    return this.getUserById(id);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async getUsers(): Promise<User[] | null> {
    return this.userModel.find().exec();
  }

  async deleteUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async initDefaultUserWithRole(): Promise<void> {
    const userCount = await this.userModel.countDocuments().exec();
    if (userCount > 0) {
      console.log('Default user already exists');
      return;
    }

    const role = new Role();
    role.name = 'Admin';
    role.permissions = getAllPermissions();

    const createdRole = await this.roleModel.create(role);

    const user = new User();
    user.firstname = 'Admin';
    user.lastname = 'Admin';
    user.email = 'admin@scrap-snap.com';
    user.password = await bcrypt.hash('demo', 10);
    user.roleId = createdRole.id;
    user.createdAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    await this.userModel.create(user);
    console.log('Default user created');
  }
}
