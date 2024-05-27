import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { Role } from "../schemas/role.schema";

export class RoleDto extends PickType(Role, ['_id', 'name', 'permissions'] as const) {
    @ApiProperty()
    @IsString()
    id: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    permissions: number[]

    @ApiProperty()
    isDefault: boolean

    constructor(args?: Partial<RoleDto>) {
        super();
        Object.assign(this, args);
    }
}

