import { ActionIcon, Card, Group, Stack, Text, Title } from '@mantine/core';
import { bucketName } from '@/types/bucketName';
import { cn } from '@/lib/utils';
import { downloadAndSave, uploadFile } from '@/services/storage.service';
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { formatFileSize } from '@/utils/formatNumber';
import { IconCloudUpload, IconDownload, IconFileDescription, IconX } from '@tabler/icons-react';
import { showErrorNotification } from '@/utils/errors';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BillFile } from '../../types/billFile';

interface FileSectionProps {
  billId?: number;
  referencePeriod: string;
  files: BillFile[];
  onChange: (files: BillFile[]) => void;
  onRemoveSavedFile: (file: BillFile) => void;
}

const getFileKey = (file: Pick<BillFile, 'filename' | 'storage_path'>) => {
  return file.storage_path || file.filename;
};

export default function FileSection({
  billId,
  referencePeriod,
  files,
  onChange,
  onRemoveSavedFile
}: FileSectionProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'bills.form.filesSection' });

  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDrop = async (nextFiles: File[]) => {
    const newFiles = nextFiles.filter(
      file => !files.some(f => f.filename === file.name && f.size === file.size)
    );

    if (!newFiles.length) return;

    setIsUploading(true);

    try {
      const folder = `temp/${referencePeriod}/${billId ?? 'new'}`;
      const uploadedFiles = await Promise.all(
        newFiles.map(async file => ({
          filename: file.name,
          storage_path: await uploadFile(bucketName.BILL_FILES, folder, file),
          size: file.size
        }))
      );

      onChange([...files, ...uploadedFiles]);
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (file: BillFile) => {
    if (file.id) onRemoveSavedFile(file);

    onChange(files.filter(f => getFileKey(f) !== getFileKey(file)));
  };

  const handleDownload = async (file: BillFile) => {
    try {
      setIsDownloading(true);
      await downloadAndSave(bucketName.BILL_FILES, file.storage_path, file.filename);
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Stack gap="xl">
      <Card radius="lg" padding="lg" shadow="sm" withBorder>
        <Stack gap="lg">
          <Title order={4}>{t('sectionTitle')}</Title>

          <Dropzone
            onDrop={handleDrop}
            disabled={isUploading || files.length >= 3}
            maxSize={5 * 1024 ** 2}
            maxFiles={Math.max(1, 3 - files.length)}
            accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
            loading={isUploading}
            loaderProps={{ type: 'dots' }}
          >
            <Group
              justify="center"
              align="center"
              gap="0"
              mih={220}
              style={{ pointerEvents: 'none' }}
            >
              <Dropzone.Idle>
                <Group className="text-primary bg-primary-foreground flex flex-col items-center justify-center rounded-full p-4">
                  <IconCloudUpload size={26} />
                </Group>
              </Dropzone.Idle>

              <Stack gap="xs" align="center" className="text-center">
                <Text inline>{t('addFile')}</Text>
                <Text size="sm" className="text-muted-foreground">
                  {t('addFileDescription')}
                </Text>
              </Stack>
            </Group>
          </Dropzone>

          {files.length > 0 && (
            <Stack gap="xs">
              {files.map(file => (
                <Group
                  key={getFileKey(file)}
                  className={cn(
                    'bg-primary-foreground items-center gap-2 rounded-md p-3',
                    file.id && 'bg-background'
                  )}
                >
                  <IconFileDescription size={20} className="text-primary" />
                  <Text size="sm">{file.filename}</Text>
                  <Text size="xs" className="text-muted-foreground ml-4">
                    {formatFileSize(file.size)}
                  </Text>
                  <Group className="ml-auto" gap="0">
                    {file.id && (
                      <ActionIcon
                        variant="subtle"
                        size="xs"
                        onClick={() => handleDownload(file)}
                        aria-label={t('downloadFile')}
                        loading={isDownloading}
                      >
                        <IconDownload size={14} />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => handleRemove(file)}
                      aria-label={t('removeFile')}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
