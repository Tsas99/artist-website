import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCvEntryDto } from './dto/create-cv-entry.dto';
import { UpdateCvEntryDto } from './dto/update-cv-entry.dto';

@Injectable()
export class CvEntryService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    create(CreateCvEntryDto: CreateCvEntryDto) {
        return this.prisma.cVEntry.create({
            data:CreateCvEntryDto,
        });
    }

    findAll() {
        return this.prisma.cVEntry.findMany({
            orderBy:[
                {sortOrder:'asc',},
                {year: 'desc',},
                {id:'desc'},
            ],
        });
    }

    async findOne(id: number) {
        const entry = await this.prisma.cVEntry.findUnique({
            where:{id},
        });

        if (!entry) {
            throw new NotFoundException(
                'CV entry not found.',
            );
        }
        return entry;
    }

    async update(
        id: number,
        UpdateCvEntryDto:UpdateCvEntryDto,
    ) {
        await this.findOne(id);
        return this.prisma.cVEntry.update({
            where: {id},
            data: UpdateCvEntryDto,
        });
    }
    async remove(id:number) {
        await this.findOne(id);
        return this.prisma.cVEntry.delete({
            where:{id},
        });
    }
}
