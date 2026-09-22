import { Module } from '@nestjs/common';
import { PressMediaService } from './press-media.service';
import { PressMediaController } from './press-media.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[PrismaModule, UploadModule, AuthModule,],
  providers: [PressMediaService],
  controllers: [PressMediaController]
})
export class PressMediaModule {}
