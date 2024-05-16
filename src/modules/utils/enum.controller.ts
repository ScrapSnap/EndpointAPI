import { Controller, Get } from '@nestjs/common';
import { garbageTypeValues, frequencyValues } from './enum-utils'; // Adjust the import path accordingly

@Controller('enums')
export class EnumController {
  @Get('garbage-types')
  getAllGarbageTypes() {
    return garbageTypeValues;
  }

  @Get('frequencies')
  getAllFrequencies() {
    return frequencyValues;
  }
}