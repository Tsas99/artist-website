import { Module } from '@nestjs/common';
import { WorkService } from './work.service';
import { WorkController } from './work.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ PrismaModule, AuthModule],
  controllers: [WorkController],
  providers: [WorkService],
})
export class WorkModule {}
