import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkMediaDto } from './dto/create-work-media.dto';
import { UpdateWorkMediaDto } from './dto/update-work-media.dto';

@Injectable()
export class WorkMediaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createWorkMediaDto: CreateWorkMediaDto) {
    return this.prisma.workMedia.create({
      data: createWorkMediaDto,
    });
  }

  findAll() {
    return this.prisma.workMedia.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  findByWork(workId: number) {
    return this.prisma.workMedia.findMany({
      where: {
        workId,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.workMedia.findUnique({
      where: {
        id,
      },
    });
  }

  update(
    id: number,
    updateWorkMediaDto: UpdateWorkMediaDto,
  ) {
    return this.prisma.workMedia.update({
      where: {
        id,
      },
      data: updateWorkMediaDto,
    });
  }

  remove(id: number) {
    return this.prisma.workMedia.delete({
      where: {
        id,
      },
    });
  }
}