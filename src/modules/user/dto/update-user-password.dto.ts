import { ApiResponseProperty } from '@nestjs/swagger';

export class UpdateUserPasswordDto {
    @ApiResponseProperty()
    currentPassword: string;

    @ApiResponseProperty()
    newPassword: string;
}
