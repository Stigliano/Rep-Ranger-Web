import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadDir = 'uploads';

  constructor() {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const folderPath = path.join(this.uploadDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);
    
    await fs.promises.writeFile(filePath, file.buffer);
    
    // Return relative path or URL. For local dev, we might serve static files.
    // Assuming we serve 'uploads' at '/uploads'
    return `/uploads/${folder}/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract relative path from URL
    // This is a naive implementation for local storage
    const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    const filePath = path.join(process.cwd(), relativePath);
    
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }
}
