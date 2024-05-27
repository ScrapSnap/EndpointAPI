import {BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from "@nestjs/common";
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
import { Permissions } from "./enums/permissions.decorator";
import { Permission } from "./enums/permissions.enum";

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
    @Permissions(Permission.WRITE_USERS)
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
        role.isDefault = false;

        const createdRole = await this.roleService.createRole(role);
        return new RoleDto(createdRole);
    }

    @Put('/:id')
    @Permissions(Permission.WRITE_USERS)
    @ApiOperation({ summary: 'Update role' })
    @ApiOkResponse({ type: RoleDto })
    @ApiUnauthorizedResponse()
    @ApiBadRequestResponse()
    async updateRole(@Param('id') id: string, @Body() body: CreateRoleDto): Promise<RoleDto> {
        if (!body) {
            throw new BadRequestException('Role data is required.');
        }

        const role = await this.roleService.getRoleById(id);
        if (!role) {
            throw new BadRequestException('Role not found.');
        }

        role.name = body.name;
        role.permissions = body.permissions;

        const updatedRole = await this.roleService.updateRoleById(id, role);
        return new RoleDto(updatedRole);
    }

    @Delete('/:id')
    @Permissions(Permission.WRITE_USERS)
    @ApiOperation({ summary: 'Delete role by id' })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    @ApiBadRequestResponse()
    async deleteRole(@Param('id') id: string): Promise<void> {
        await this.roleService.deleteRoleById(id);
    }
}
