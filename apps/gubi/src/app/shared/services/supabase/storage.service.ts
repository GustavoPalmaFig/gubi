import { eBucketName } from '@shared/enums/bucketName.enum';
import { inject, Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private supabase = inject(SupabaseService).client;

  async uploadFile(bucket: eBucketName, folder: string, file: File, options?: { returnUrl: boolean }): Promise<string> {
    const path = this.generateFilePath(file, folder);
    const { data: uploadData, error } = await this.supabase.storage.from(bucket).upload(path, file);

    if (error) throw error.message;

    if (options?.returnUrl) {
      const publicRes = this.supabase.storage.from(bucket).getPublicUrl(uploadData.path);
      if (publicRes?.data) return publicRes.data.publicUrl;
    }
    return uploadData.path ?? path;
  }

  async downloadAndSave(bucket: eBucketName, path: string, filename: string): Promise<void> {
    const { data, error } = await this.supabase.storage.from(bucket).download(path);
    if (error) throw error.message;

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async openSignedUrlInNewTab(bucket: eBucketName, path: string, ttlSeconds = 60) {
    const { data, error } = await this.supabase.storage.from(bucket).createSignedUrl(path, ttlSeconds);
    if (error) throw error;
    if (!data) throw new Error('No file encountered');
    const signedUrl = data.signedUrl;
    window.open(signedUrl, '_blank');
  }

  async delete(bucket: eBucketName, path: string): Promise<boolean> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return true;
  }

  private generateFilePath(file: File, folder: string): string {
    return `${folder}/${uuidv4()}-${file.name}`;
  }
}
