import { ActionIcon, Group, Stack, Text } from '@mantine/core';
import { bucketName } from '@/types/bucketName';
import { downloadAndSave } from '@/services/storage.service';
import { formatFileSize } from '@/utils/formatNumber';
import { IconDownload, IconFileDescription } from '@tabler/icons-react';
import { showErrorNotification } from '@/utils/errors';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BillFile } from '@/features/bills/types/billFile';

export default function FilesTab({ files }: { files: BillFile[] }) {
  const { t } = useTranslation('translation', { keyPrefix: 'bills.card.detailsModal.tabs.files' });

  const [isDownloadingFiles, setIsDownloadingFiles] = useState<number[]>([]);

  const handleDownload = async (file: BillFile) => {
    if (!file.id) return;

    try {
      setIsDownloadingFiles(prev => [...prev, file.id!]);
      await downloadAndSave(bucketName.BILL_FILES, file.storage_path, file.filename);
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setIsDownloadingFiles(prev => prev.filter(id => id !== file.id));
    }
  };

  return (
    <Stack>
      {files.length === 0 ? (
        <Text>{t('noFiles')}</Text>
      ) : (
        <Stack gap="xs">
          {files.map(file => (
            <Group
              key={file.id}
              className="bg-primary-foreground border-primary/20 items-center gap-2 rounded-md border p-3"
            >
              <IconFileDescription size={20} className="text-primary" />
              <Text size="sm">{file.filename}</Text>

              <Text size="xs" className="text-muted-foreground ml-4">
                {formatFileSize(file.size)}
              </Text>

              <ActionIcon
                variant="transparent"
                size="xs"
                onClick={() => handleDownload(file)}
                aria-label={t('downloadFile')}
                loading={isDownloadingFiles.includes(file.id!)}
                className="ml-auto"
              >
                <IconDownload size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
