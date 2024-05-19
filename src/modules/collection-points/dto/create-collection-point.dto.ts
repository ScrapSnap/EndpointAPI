import { GarbageType } from "src/modules/utils/schemas/garbage-type.enum";
import { IsArray, IsEnum, IsLatitude, IsLongitude, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCollectionPointDto {
    @ApiProperty({
        description: 'List of garbage types that the collection point accepts',
        type: [String],
        enum: GarbageType,
        example: [GarbageType.GLASS, GarbageType.METAL],
    })
    @IsArray({ message: 'acceptsGarbageTypes must be an array' })
    @IsEnum(GarbageType, { each: true, message: `Each value in acceptsGarbageTypes must be a valid GarbageType` })
    acceptsGarbageTypes: GarbageType[];

    @ApiProperty({
        description: 'Location of the collection point',
        example: 'Gosposvetska cesta 87, Maribor, Slovenia',
    })
    @IsString({ message: 'location must be a string' })
    @IsNotEmpty({ message: 'location should not be empty' })
    location: string;

    @ApiProperty({
        description: 'Latitude of the collection point',
        example: 123.123,
    })
    @IsLatitude({ message: 'latitude must be a valid latitude value' })
    @IsNotEmpty({ message: 'latitude should not be empty' })
    latitude: number;

    @ApiProperty({
        description: 'Longitude of the collection point',
        example: 50.50,
    })
    @IsLongitude({ message: 'longitude must be a valid longitude value' })
    @IsNotEmpty({ message: 'longitude should not be empty' })
    longitude: number;
}