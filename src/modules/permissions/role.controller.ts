import { BadRequestException, Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { UserDto } from "../user/dto/user.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { RoleDto } from "./dto/role.dto";
import { RoleService } from "./role.service";
import { Role } from "./schemas/role.schema";

@Controller('roles')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    @ApiOperation({ summary: 'Create new role' })
    @ApiOkResponse({ type: UserDto })
    @ApiUnauthorizedResponse()
    @ApiBadRequestResponse()
    async createRole(@Body() body: CreateRoleDto): Promise<RoleDto> {
        if (!body) {
            throw new BadRequestException('User data is required.');
        }

        const existingRole = await this.roleService.getRoleByName(body.name);
        if (existingRole) {
            throw new BadRequestException('Role with that name already exists.');
        }

        const role = new Role();
        role.name = body.name;
        role.permissions = body.permissions;

        const createdRole = await this.roleService.createRole(role);
        return new RoleDto(createdRole);
    }
}
