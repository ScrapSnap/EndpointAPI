import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { Schedule } from '../schemas/schedule.schema';
import { GarbageType } from '../../utils/schemas/garbage-type.enum';
import { Frequency } from '../../utils/schemas/frequency.enum';

export class CreateScheduleDto extends PickType(Schedule, ['garbagetype', 'location', 'footnote', 'frequency', 'date'] as const) {
  @ApiProperty()
  @IsEnum(GarbageType)
  garbagetype: GarbageType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  footnote: string;

  @ApiProperty()
  @IsEnum(Frequency)
  frequency: Frequency;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  date: Date;
}