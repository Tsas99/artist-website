import { Module } from '@nestjs/common';
import { CvEntryService } from './cv-entry.service';
import { CvEntryController } from './cv-entry.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[PrismaModule, AuthModule,],
  providers: [CvEntryService],
  controllers: [CvEntryController]
})
export class CvEntryModule {}
