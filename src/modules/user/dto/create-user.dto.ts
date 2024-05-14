import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '../schemas/user.schema';

export class CreateUserDto extends PickType(User, [
  '_id',
  'firstname',
  'lastname',
  'password',
  'username',
]) {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  username: string;

  constructor(args?: Partial<CreateUserDto>) {
    super();
    Object.assign(this, args);
  }
}
