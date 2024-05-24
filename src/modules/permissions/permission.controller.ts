import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { PermissionService } from "./permission.service";
import { Request } from "express";

@Controller('permissions')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Get()
    @ApiOperation({ summary: 'Get permission for current user' })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    @ApiBadRequestResponse()
    async getPermissions(@Req() request: Request): Promise<number[]> {
        const userId = request['user'].userId;
        return this.permissionService.getPermissionsByUserId(userId);
    }
}
