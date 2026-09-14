import { Module } from '@nestjs/common';
import { WorkMediaService } from './work-media.service';
import { WorkMediaController } from './work-media.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkMediaController],
  providers: [WorkMediaService],
})
export class WorkMediaModule {}
