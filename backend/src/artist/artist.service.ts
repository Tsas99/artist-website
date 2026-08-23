import { Injectable } from '@nestjs/common';
import { Artist, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ArtistCreateInput): Promise<Artist> {
    return this.prisma.artist.create({ data });
  }

  findAll(): Promise<Artist[]> {
    return this.prisma.artist.findMany();
  }
}