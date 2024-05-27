import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Role } from "../roles/schemas/role.schema";
import { Model } from "mongoose";
import { User } from "../user/schemas/user.schema";

@Injectable()
export class PermissionService {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<Role>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async getPermissionsByUserId(userId: string): Promise<number[]> {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            return [];
        }

        const role = await this.roleModel.findById(user.roleId).exec();
        if (!role) {
            return [];
        }

        return role.permissions;
    }
}
