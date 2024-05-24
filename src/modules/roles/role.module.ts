import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { AuthGuard } from '../auth/auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PermissionsGuard } from "../permissions/permission.guard";
import { Role, RoleSchema } from "./schemas/role.schema";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";

dotenv.config();

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI),
        MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    ],
    controllers: [RoleController],
    providers: [RoleService, AuthGuard, JwtService, PermissionsGuard],
})
export class RoleModule {}
