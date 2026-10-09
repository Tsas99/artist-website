
import { Module } from '@nestjs/common';

import { ExhibitionMediaController } from './exhibition-media.controller';


import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';
import { ExhibitionMediaService } from './exhibtion-media.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UploadModule,
  ],
  controllers: [ExhibitionMediaController],
  providers: [ExhibitionMediaService],
})
export class ExhibitionMediaModule {}
