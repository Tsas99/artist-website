import { Module } from '@nestjs/common';
import { WorkMediaService } from './work-media.service';
import { WorkMediaController } from './work-media.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WorkMediaController],
  providers: [WorkMediaService],
})
export class WorkMediaModule {}
