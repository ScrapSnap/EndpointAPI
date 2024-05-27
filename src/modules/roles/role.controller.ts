import {BadRequestException, Body, Controller, Get, Post, UseGuards} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { CreateRoleDto } from "./dto/create-role.dto";
import { RoleDto } from "./dto/role.dto";
import { RoleService } from "./role.service";
import { Role } from "./schemas/role.schema";

@Controller('roles')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get()
    @ApiOperation({ summary: 'Get all roles' })
    @ApiOkResponse({ type: [RoleDto] })
    @ApiUnauthorizedResponse()
    async getRoles(): Promise<RoleDto[]> {
        const roles = await this.roleService.getRoles();
        return roles.map(role => {
            const roleDto = new RoleDto();
            roleDto.id = role._id;
            roleDto.name = role.name;
            roleDto.permissions = role.permissions;
            return roleDto;
        });
    }

    @Post()
    @ApiOperation({ summary: 'Create new roles' })
    @ApiOkResponse({ type: RoleDto })
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
