import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GlobalRedisService } from '../redis/globa-redis.service';

@WebSocketGateway(3002, {
  cors: {
    origin: '*', // Allow all origins
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AppGateway.name);
  constructor(private readonly redisService: GlobalRedisService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('messages')
  async handleCacheMessage(@MessageBody() data: string) {
    this.logger.debug(`Message is taken...`);
    await this.redisService.getClient().publish('messages', data);
  }

  handleConnection(client: Socket): any {
    this.server.emit('user-joined', {
      message: `The new user joined to chat: ${client.id}`,
    });
  }
  handleDisconnect(client: Socket): any {
    this.server.emit('user-left', { message: `User left the chat: ${client.id}` });
  }

  @SubscribeMessage('ping')
  handleMessage(client: Socket, message: any): void {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${message}`);
    client.emit('reply', 'this is a reply');
    this.server.emit('reply', 'broadcasting...');
  }
}
