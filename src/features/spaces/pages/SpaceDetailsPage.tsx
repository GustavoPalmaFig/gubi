import { BillFormModal } from '@/features/bills/components/BillFormModal';
import { Center, Group, Loader, Stack, Title, Text, Tabs, Button } from '@mantine/core';
import { IconCalendarWeek, IconPlus } from '@tabler/icons-react';
import { NotFound } from '@/components/layout/NotFound';
import { useDisclosure } from '@mantine/hooks';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Bill } from '@/features/bills/types/bill';
import { SpaceMenu } from '../components/SpaceMenu';
import { useSpaceFormData } from '../hooks/useSpace';
import SpaceIcon from '../components/SpaceIcon';
import SpaceMembers from '../components/SpaceMembers';

export default function SpaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isBillFormOpen, { open: openBillForm, close: closeBillForm }] = useDisclosure(false);
  const [selectedBill] = useState<Bill | undefined>(undefined);

  const { data: space, isLoading: isLoadingSpace } = useSpaceFormData(Number(id));

  const { formatDate } = useLocalizationFormatters();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces' });

  if (!space && !isLoadingSpace) return <NotFound />;

  return isLoadingSpace ? (
    <Center className="min-h-[50dvh]">
      <Loader type="dots" />
    </Center>
  ) : (
    space && (
      <>
        <Stack gap="xl">
          <Group justify="space-between">
            <Group align="end">
              <SpaceIcon icon={space.icon} color={space.color} />

              <Stack gap="2" className="mt-auto">
                <Group align="center" gap="8">
                  <Title order={2}>{space.name}</Title>
                  <SpaceMenu space={space} onEdit={() => navigate(`/spaces/${space.id}/edit`)} />
                </Group>

                <Group align="center" gap="3">
                  <IconCalendarWeek size={16} className="text-muted-foreground mb-0.5" />
                  <Text className="text-muted-foreground text-sm">
                    {t('created_at', {
                      date: formatDate(new Date(), { year: 'numeric', month: 'long' })
                    })}
                  </Text>
                </Group>
              </Stack>
            </Group>

            <SpaceMembers members={space.members} />
          </Group>

          <Text className="text-sm">{space.description}</Text>

          <Tabs defaultValue="bills">
            <Tabs.List>
              <Tabs.Tab value="bills">{t('tabs.bills.title')}</Tabs.Tab>
              <Tabs.Tab value="expenses">{t('tabs.expenses.title')}</Tabs.Tab>
              <Tabs.Tab value="members">{t('tabs.members.title')}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="bills" pt="md">
              <Stack>
                <Group justify="end">
                  <Button
                    variant="outline"
                    leftSection={<IconPlus size={16} />}
                    onClick={openBillForm}
                  >
                    {t('tabs.bills.add_bill')}
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="expenses" pt="md">
              <Stack>
                <Group justify="end">
                  <Button variant="outline" leftSection={<IconPlus size={16} />}>
                    {t('tabs.expenses.add_expense')}
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="members" pt="md">
              Third tab
            </Tabs.Panel>
          </Tabs>
        </Stack>

        <BillFormModal
          opened={isBillFormOpen}
          onClose={closeBillForm}
          bill={selectedBill}
          space={space}
        />
      </>
    )
  );
}
