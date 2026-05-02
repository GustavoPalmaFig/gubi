export const bucketName = {
  BILL_FILES: 'bill_files',
  AVATARS: 'avatars'
} as const;

export type BucketName = (typeof bucketName)[keyof typeof bucketName];
