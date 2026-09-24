import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UploadModule } from "../upload/upload.module";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";

@Module({
    imports: [
        AuthModule, UploadModule,
    ],
    controllers: [NewsController],
    providers: [NewsService],
})
export class NewsModule {}