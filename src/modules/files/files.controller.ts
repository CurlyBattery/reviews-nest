import {
  Controller,
  Get,
  Res,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { IdNumberParamDto } from '@app/dtos';

@Controller('files')
@UseInterceptors(ClassSerializerInterceptor)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id')
  async getFileById(@Param() { id }: IdNumberParamDto) {
    const file = await this.filesService.getFileById(Number(id));

    return new StreamableFile(file.data, {
      type: 'image',
      disposition: `inline; filename="${file.filename}"`,
    });
  }
}
