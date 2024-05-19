import { PartialType } from '@nestjs/swagger';
import { CreateCollectionPointDto } from './create-collection-point.dto';

export class UpdateCollectionPointDto extends PartialType(CreateCollectionPointDto) {
}
