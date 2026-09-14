import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtistModule } from './artist/artist.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkModule } from './work/work.module';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { WorkMediaModule } from './work-media/work-media.module';


@Module({
  imports:  [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, ArtistModule, WorkModule, UploadModule, WorkMediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

