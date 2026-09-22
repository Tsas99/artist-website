import { Module } from '@nestjs/common';
import { PressService } from './press.service';
import { PressController } from './press.controller';
import { UploadModule } from '../upload/upload.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ PrismaModule, UploadModule, AuthModule],
  providers: [PressService],
  controllers: [PressController],
})
export class PressModule {}
