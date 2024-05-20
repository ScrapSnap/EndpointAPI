import { ApiProperty, PickType } from '@nestjs/swagger';
import { Stat } from '../schemas/stat.schema';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsDate, IsDateString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class GarbageCollectedDto {
  @IsNumber()
  paper: number;

  @IsNumber()
  plastic: number;

  @IsNumber()
  glass: number;

  @IsNumber()
  metal: number;

  @IsNumber()
  organic: number;
}

export class CreateStatDto extends PickType(Stat, ['userId', 'date', 'garbageCollected'] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  @ValidateNested()
  @Type(() => GarbageCollectedDto)
  @IsNotEmpty()
  garbageCollected: GarbageCollectedDto;
}
