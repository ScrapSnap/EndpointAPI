import { PartialType } from "@nestjs/swagger";
import { RoleDto } from "./role.dto";

export class CreateRoleDto extends PartialType(RoleDto) {}
