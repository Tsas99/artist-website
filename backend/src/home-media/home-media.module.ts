import { Module } from '@nestjs/common';

import { UploadModule } from '../upload/upload.module';

import { HomeMediaController } from './home-media.controller';
import { HomeMediaService } from './home-media.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    UploadModule,
    AuthModule
  ],
  controllers: [
    HomeMediaController,
  ],
  providers: [
    HomeMediaService,
  ],
})
export class HomeMediaModule {}