import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from "./schemas/role.schema";

@Injectable()
export class RoleService {
    constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

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
}
