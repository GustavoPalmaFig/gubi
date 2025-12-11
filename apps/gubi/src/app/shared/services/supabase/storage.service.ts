import { eBucketName } from '@shared/enums/bucketName.enum';
import { inject, Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private supabase = inject(SupabaseService).client;

  async uploadFile(bucket: eBucketName, folder: string, file: File): Promise<string> {
    const path = this.generateFilePath(file, folder);
    const { data, error } = await this.supabase.storage.from(bucket).upload(path, file);

    if (error) throw error.message;
    return data.path ?? path;
  }

  //DECIDIR QUAL DOS DOIS USAR
  async downloadAndSave(bucket: eBucketName, path: string, filename: string): Promise<void> {
    // 1) pega o blob via SDK (autenticado)
    const { data, error } = await this.supabase.storage.from(bucket).download(path);
    if (error) throw error.message;

    // 2) força o download (usando anchor)
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // libera memória
    URL.revokeObjectURL(url);
  }

  //DECIDIR QUAL DOS DOIS USAR
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
    const fileName = file.name;
    // const fileExt = fileName.split('.').pop();

    return `${folder}/${uuidv4()}-${fileName}`;
  }
}
