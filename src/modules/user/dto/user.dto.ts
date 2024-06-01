import { ApiResponseProperty } from '@nestjs/swagger';
import { User } from '../schemas/user.schema';

export class UserDto {
  @ApiResponseProperty()
  _id: string;

  @ApiResponseProperty()
  createdAt: string;

  @ApiResponseProperty()
  firstname: string;

  @ApiResponseProperty()
  lastname: string;

  @ApiResponseProperty()
  updatedAt: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  location: string;

  @ApiResponseProperty()
  roleId: string;

  constructor(args?: Partial<User>) {
    this._id = args._id;
    this.createdAt = args.createdAt;
    this.firstname = args.firstname;
    this.lastname = args.lastname;
    this.updatedAt = args.updatedAt;
    this.email = args.email;
    this.location = args.location;
    this.roleId = args.roleId;
  }
}
