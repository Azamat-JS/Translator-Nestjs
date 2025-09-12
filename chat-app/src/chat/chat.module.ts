import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.controller';

@Module({
    imports: [],
    controllers: [],
    providers: [ChatGateway],
    exports: [ChatGateway],
})


export class ChatModule {}