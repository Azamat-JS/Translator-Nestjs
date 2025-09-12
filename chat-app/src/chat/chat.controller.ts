import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";


@WebSocketGateway(4004, {cors: {origin: '*'}})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

  @WebSocketServer() server: Server;

  handleConnection(client: Socket){
    console.log('Client connected:', client.id);
    this.server.emit('user-joined', { message: `A new user has joined the chat!: ${client.id}` });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    this.server.emit('user-left', { message: `A user has left the chat!: ${client.id}` });
  }

  @SubscribeMessage('newMessage')
  handleMessage(@MessageBody() message:string): void {
   this.server.emit('onMessage', { message });
   console.log('Message received:', message);
  }
}