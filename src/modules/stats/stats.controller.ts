import {StatsService} from './stats.service';
import {CreateStatDto} from './dto/create-stat.dto';
import {UpdateStatDto} from './dto/update-stat.dto';
import {Stat} from './schemas/stat.schema';
import {AuthGuard} from '../auth/auth.guard';
import {Permissions} from '../permissions/enums/permissions.decorator';

import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards,} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {Permission} from "../permissions/enums/permissions.enum";

@ApiTags('stats')
@UseGuards(AuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post()
  @Permissions(Permission.WRITE_USER_STATISTICS)
  @ApiOperation({ summary: 'Create stat for user' })
  @ApiOkResponse({ type: CreateStatDto })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  async create(@Body() createStatDto: CreateStatDto) {
    return this.statsService.create(createStatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stats' })
  @ApiOkResponse({ type: [Stat] })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async findAll() {
    return this.statsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stat by id' })
  @ApiOkResponse({ type: Stat })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async findOne(@Param('id') id: string) {
    return this.statsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stat by id' })
  @ApiOkResponse({ type: Stat })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async update(@Param('id') id: string, @Body() updateStatDto: UpdateStatDto) {
    return this.statsService.update(id, updateStatDto);
  }

  @Delete(':id')
  @Permissions(Permission.DELETE_USER_STATISTICS)
  @ApiOperation({ summary: 'Delete stat by id' })
  @ApiOkResponse({ type: Stat })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async remove(@Param('id') id: string) {
    return this.statsService.delete(id);
  }

  @Delete()
  @Permissions(Permission.DELETE_USER_STATISTICS)
  @ApiOperation({ summary: 'Delete all stats' })
  @ApiOkResponse({ type: Stat })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async removeAll() {
    return this.statsService.deleteAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get stats by user id' })
  @ApiOkResponse({ type: [Stat] })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async findStatByUserId(@Param('userId') userId: string) {
    return this.statsService.findStatByUserId(userId);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get stats by date' })
  @ApiOkResponse({ type: [Stat] })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async findStatByDate(@Param('date') date: Date) {
    return this.statsService.findStatByDate(date);
  }

  @Get('with-garbage-type/:type')
  @ApiOperation({ summary: 'Get stats with garbage type' })
  @ApiOkResponse({ type: [Stat] })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async findWithGarbageType(@Param('type') type: string): Promise<Stat[]> {
    return this.statsService.findWithGarbageType(type);
  }
}
