import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilesRepository } from './files.repository';

@Injectable()
export class FilesService {
  constructor(private repository: FilesRepository) {}

  async uploadFile(dataBuffer: Buffer, filename: string) {
    try {
      return await this.repository.createFile({
        data: {
          filename,
          data: dataBuffer,
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async getFileById(id: number) {
    const [file] = await this.repository.getFiles({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async deleteFile(id: number) {
    const [existsFile] = await this.repository.getFiles({ where: { id } });
    if (!existsFile) {
      throw new NotFoundException('File not found');
    }

    const deletedUser = await this.repository.deleteFile({
      where: {
        id,
      },
    });
    if (!deletedUser) {
      throw new BadRequestException('File failed to delete');
    }
    return deletedUser;
  }
}
