import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import * as dotenv from 'dotenv';
import { AuthGuard } from '../auth/auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PermissionsGuard } from "../permissions/permission.guard";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { RoleService } from "../roles/role.service";

dotenv.config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, AuthGuard, JwtService, PermissionsGuard, RoleService],
})
export class UserModule {}
