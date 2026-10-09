import { Module } from '@nestjs/common';

import { ExhibitionController } from './exhibition.controller';
import { ExhibitionService } from './exhibition.service';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, AuthModule, UploadModule],
  controllers: [ExhibitionController],
  providers: [ExhibitionService],
})
export class ExhibitionModule {}