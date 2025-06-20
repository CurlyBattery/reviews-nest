import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesRepository } from './files.repository';
import { PrismaModule } from '../../database/prisma.module';
import { FilesController } from './files.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FilesController],
  providers: [FilesRepository, FilesService],
  exports: [FilesService],
})
export class FilesModule {}
