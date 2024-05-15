import { ApiResponseProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  password: string;

  constructor(args?: Partial<LoginUserDto>) {
    this.email = args.email;
    this.password = args.password;
  }
}
