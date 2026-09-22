import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreatePressMediaDto } from './dto/create-press-media.dto';
import { UpdatePressMediaDto } from './dto/update-press-media.dto';

@Injectable()
export class PressMediaService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly uploadService: UploadService,
    ) {}

    async create(
        createPressMediaDto: CreatePressMediaDto,
    ) {
        const press =
            await this.prisma.press.findUnique({
                where: {
                    id: createPressMediaDto.pressId,
                },
            });

        if (!press) {
            throw new NotFoundException(
                'Press entry not found.',
            );
        }

        return this.prisma.pressMedia.create({
            data: {
                url: createPressMediaDto.url,
                publicId:
                    createPressMediaDto.publicId,
                pressId:
                    createPressMediaDto.pressId,
                sortOrder:
                    createPressMediaDto.sortOrder ??
                    0,
            },
        });
    }

    async findAll() {
        return this.prisma.pressMedia.findMany({
            orderBy: [
                {
                    pressId: 'asc',
                },
                {
                    sortOrder: 'asc',
                },
                {
                    id: 'asc',
                },
            ],
        });
    }

    async findByPress(
        pressId: number,
    ) {
        return this.prisma.pressMedia.findMany({
            where: {
                pressId,
            },
            orderBy: [
                {
                    sortOrder: 'asc',
                },
                {
                    id: 'asc',
                },
            ],
        });
    }

    async findOne(id: number) {
        const media =
            await this.prisma.pressMedia.findUnique({
                where: {
                    id,
                },
            });

        if (!media) {
            throw new NotFoundException(
                'Press media not found.',
            );
        }

        return media;
    }

    async update(
        id: number,
        updatePressMediaDto: UpdatePressMediaDto,
    ) {
        await this.findOne(id);

        if (
            updatePressMediaDto.pressId !==
            undefined
        ) {
            const press =
                await this.prisma.press.findUnique({
                    where: {
                        id: updatePressMediaDto.pressId,
                    },
                });

            if (!press) {
                throw new NotFoundException(
                    'Press entry not found.',
                );
            }
        }

        return this.prisma.pressMedia.update({
            where: {
                id,
            },
            data: updatePressMediaDto,
        });
    }

    async remove(id: number) {
        const media =
            await this.findOne(id);

        await this.uploadService.deleteMedia(
            media.publicId,
            'image',
        );

        return this.prisma.pressMedia.delete({
            where: {
                id,
            },
        });
    }
}