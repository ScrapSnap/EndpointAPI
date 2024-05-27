import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleDto } from './dto/schedule.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Schedule } from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from "../permissions/permission.guard";
import { Permission } from "../roles/enums/permissions.enum";
import { Permissions } from '../roles/enums/permissions.decorator';

@ApiTags('schedules')
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @Permissions(Permission.WRITE_SCHEDULES)
  @ApiOperation({ summary: 'Create schedule' })
  @ApiOkResponse({ type: ScheduleDto })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedules' })
  @ApiOkResponse({ type: [ScheduleDto] })
  async findAll(): Promise<ScheduleDto[]> {
    const schedules = await this.scheduleService.findAll();
    return schedules.map((schedule) => new ScheduleDto(schedule));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by id' })
  @ApiOkResponse({ type: ScheduleDto })
  @ApiNotFoundResponse()
  async findOne(@Param('id') id: string): Promise<ScheduleDto> {
    const schedule = await this.scheduleService.findOne(id);
    return new ScheduleDto(schedule);
  }

  @Put(':id')
  @Permissions(Permission.WRITE_SCHEDULES)
  @ApiOperation({ summary: 'Update schedule by id' })
  @ApiOkResponse({ type: ScheduleDto })
  @ApiNotFoundResponse()
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<ScheduleDto> {
    const schedule: Schedule = {
      _id: id,
      dateAdded: new Date(),
      ...updateScheduleDto,
    };
    const updatedSchedule = await this.scheduleService.update(id, schedule);
    return new ScheduleDto(updatedSchedule);
  }

  @Delete(':id')
  @Permissions(Permission.DELETE_SCHEDULES)
  @ApiOperation({ summary: 'Delete schedule by id' })
  @ApiOkResponse({ type: ScheduleDto })
  @ApiNotFoundResponse()
  async delete(@Param('id') id: string): Promise<ScheduleDto> {
    const schedule = await this.scheduleService.delete(id);
    return new ScheduleDto(schedule);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all schedules' })
  @ApiOkResponse()
  async deleteAll(): Promise<any> {
    return this.scheduleService.deleteAll();
  }

  @Get('garbage-type/:garbageType')
  @ApiOperation({ summary: 'Get schedule by garbage type' })
  @ApiOkResponse({ type: [ScheduleDto] })
  async findScheduleByGarbageType(@Param('garbageType') garbageType: string): Promise<ScheduleDto[]> {
    const schedules = await this.scheduleService.findScheduleByGarbageType(garbageType);
    return schedules.map((schedule) => new ScheduleDto(schedule));
  }

  @Get('location/:location')
  @ApiOperation({ summary: 'Get schedule by location' })
  @ApiOkResponse({ type: [ScheduleDto] })
  async findScheduleByLocation(@Param('location') location: string): Promise<ScheduleDto[]> {
    const schedules = await this.scheduleService.findScheduleByLocation(location);
    return schedules.map((schedule) => new ScheduleDto(schedule));
  }

  @Get('frequency/:frequency')
  @ApiOperation({ summary: 'Get schedule by frequency' })
  @ApiOkResponse({ type: [ScheduleDto] })
  async findScheduleByFrequency(@Param('frequency') frequency: string): Promise<ScheduleDto[]> {
    const schedules = await this.scheduleService.findScheduleByFrequency(frequency);
    return schedules.map((schedule) => new ScheduleDto(schedule));
  }

  @UseGuards(AuthGuard)
  @Post('replace-all')
  @ApiOperation({ summary: 'Replace all schedules' })
  @ApiOkResponse()
  async replaceAllSchedules(@Body() schedules: CreateScheduleDto[]): Promise<any> {
    return this.scheduleService.replaceAllSchedules(schedules);
  }

}
