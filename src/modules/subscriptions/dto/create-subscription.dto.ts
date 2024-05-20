import { ApiProperty, PickType } from '@nestjs/swagger';
import { Subscription } from '../schemas/subscription.schema';

export class SubscriptionKeysDto {
    @ApiProperty()
    p256dh: string;

    @ApiProperty()
    auth: string;

    constructor(args?: Partial<SubscriptionKeysDto>) {
        Object.assign(this, args);
    }
}

export class CreateSubscriptionDto extends PickType(Subscription, [
    'endpoint',
    'keys',
]) {
    @ApiProperty()
    endpoint: string;

    @ApiProperty()
    keys: SubscriptionKeysDto;

    constructor(args?: Partial<CreateSubscriptionDto>) {
        super();
        Object.assign(this, args);
    }
}
