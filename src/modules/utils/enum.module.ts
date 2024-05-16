import { Module } from '@nestjs/common';
import { EnumController } from './enum.controller'; // Adjust the import path accordingly

@Module({
  controllers: [EnumController],
})
export class EnumModule {}