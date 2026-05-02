import type { BucketName } from '@/types/bucketName';
import { supabase } from './supabase.service';

const generateFilePath = (folder: string, file: File): string => {
  return `${folder}/${file.name}`;
};

export const uploadFile = async (bucketName: BucketName, folder: string, file: File) => {
  const filePath = generateFilePath(folder, file);
  const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file);

  if (error) throw error;

  return data.path ?? filePath;
};

export const downloadAndSave = async (
  bucketName: BucketName,
  filePath: string,
  fileName: string
): Promise<void> => {
  const { data, error } = await supabase.storage.from(bucketName).download(filePath);

  if (error) throw error;

  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
