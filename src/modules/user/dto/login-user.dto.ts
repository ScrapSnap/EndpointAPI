import { ApiResponseProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiResponseProperty()
  username: string;

  @ApiResponseProperty()
  password: string;

  constructor(args?: Partial<LoginUserDto>) {
    this.username = args.username;
    this.password = args.password;
  }
}
