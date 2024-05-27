import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from "./schemas/role.schema";
import { User } from "../user/schemas/user.schema";

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<Role>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async getRoles(): Promise<Role[]> {
        return this.roleModel.find().exec();
    }

    async createRole(role: Role): Promise<Role> {
        const createRole = new this.roleModel(role);
        return createRole.save();
    }

    async getRoleByName(name: string): Promise<Role | null> {
        return this.roleModel.findOne({ name }).exec();
    }

    async getRoleById(id: string): Promise<Role | null> {
        return this.roleModel.findById(id).exec();
    }

    async getDefaultRole(): Promise<Role | null> {
        const defaultRole = this.roleModel.findOne({ isDefault: true }).exec();
        if (defaultRole) {
            return defaultRole;
        }

        const role = new Role();
        role.name = 'User';
        role.permissions = [];
        role.isDefault = true;
        return this.createRole(role);
    }

    async hasPermission(userId: string, permission: number): Promise<boolean> {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            return false;
        }

        const role = await this.getRoleById(user.roleId);
        if (!role) {
            return false;
        }

        return role.permissions.includes(permission);
    }
}
