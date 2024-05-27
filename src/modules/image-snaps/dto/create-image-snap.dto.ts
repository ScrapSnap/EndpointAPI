import { PickType, ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsDateString, IsLongitude, IsLatitude } from "class-validator";
import { ImageSnap } from "../schemas/image-snap.schema";

export class CreateImageSnapDto extends PickType(ImageSnap, ['userId', 'longitude', 'latitude'] as const) {
    @ApiProperty()
    @IsString()
    userId: string;
  
    @ApiProperty()
    @IsLongitude()
    @IsNotEmpty()
    longitude: number;
  
    @ApiProperty()
    @IsLatitude()
    @IsNotEmpty()
    latitude: number;
  }
