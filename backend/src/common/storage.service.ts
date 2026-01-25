import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private uploadDir = 'uploads';

  constructor() {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    try {
      // Try to create/access the default directory in the project root
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
      
      // Test write permission
      const testFile = path.join(this.uploadDir, '.test-write');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      
      this.logger.log(`Using storage directory: ${path.resolve(this.uploadDir)}`);
    } catch (error) {
      this.logger.warn(`Could not write to default upload dir '${this.uploadDir}': ${error.message}`);
      
      // Fallback to /tmp for Cloud Run / Read-only environments
      const tmpDir = '/tmp/uploads';
      this.logger.log(`Attempting to use fallback directory: ${tmpDir}`);
      
      try {
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        // Test write permission on fallback
        const testFile = path.join(tmpDir, '.test-write');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        
        this.uploadDir = tmpDir;
        this.logger.log(`Successfully switched to fallback storage directory: ${this.uploadDir}`);
      } catch (fallbackError) {
        this.logger.error(`Failed to initialize fallback storage directory: ${fallbackError.message}`);
        // We don't throw here to allow app to start, but uploads will likely fail
      }
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const folderPath = path.join(this.uploadDir, folder);
    
    try {
      if (!fs.existsSync(folderPath)) {
        await fs.promises.mkdir(folderPath, { recursive: true });
      }

      const filePath = path.join(folderPath, fileName);
      await fs.promises.writeFile(filePath, file.buffer);
      
      // Return URL path. Note: In Cloud Run with /tmp, these files won't be 
      // served by static assets middleware unless configured to serve /tmp.
      // But this prevents the crash.
      return `/uploads/${folder}/${fileName}`;
    } catch (error) {
      this.logger.error(`Failed to upload file to ${folderPath}: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract relative path from URL
    // Expecting format: /uploads/folder/filename.ext
    let relativePath = fileUrl;
    if (relativePath.startsWith('/uploads/')) {
      relativePath = relativePath.substring('/uploads/'.length);
    } else if (relativePath.startsWith('/')) {
      relativePath = relativePath.substring(1);
    }
    
    const filePath = path.join(this.uploadDir, relativePath);
    
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
    }
  }
}
