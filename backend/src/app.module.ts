import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtistModule } from './artist/artist.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkModule } from './work/work.module';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { WorkMediaModule } from './work-media/work-media.module';
import { AuthModule } from './auth/auth.module';
import { AboutModule } from './about/about.module';
import { CvEntryModule } from './cv-entry/cv-entry.module';
import { PressModule } from './press/press.module';
import { PressMediaModule } from './press-media/press-media.module';
import { ContactModule } from './contact/contact.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HomeMediaModule } from './home-media/home-media.module';
import { NewsModule } from './news/news.moudule';


@Module({
  imports:  [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  
    PrismaModule, ArtistModule, WorkModule, UploadModule, WorkMediaModule, AuthModule, AboutModule, CvEntryModule, PressModule, PressMediaModule, ContactModule, HomeMediaModule, NewsModule,
    
    ThrottlerModule.forRoot({
         throttlers: [
           {
              name: 'default',
              ttl: 60000,
              limit: 20,
            },
          ],
     }),
  ],

  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}

