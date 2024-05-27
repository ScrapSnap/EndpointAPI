import * as dotenv from "dotenv";
import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { AuthGuard } from "../auth/auth.guard";
import { PermissionController } from "./permission.controller";
import { PermissionService } from "./permission.service";
import { User, UserSchema } from "../user/schemas/user.schema";

dotenv.config();

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI),
        MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema}]),
    ],
    controllers: [PermissionController],
    providers: [PermissionService, AuthGuard, JwtService],
})
export class PermissionModule {}
