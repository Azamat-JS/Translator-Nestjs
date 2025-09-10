import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath:".env", isGlobal:true}),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions:{
        expiresIn: '1d'
      }
    })
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
