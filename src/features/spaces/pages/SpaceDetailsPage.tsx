import { BillFormModal } from '@/features/bills/components/billForm/BillFormModal';
import { Center, Group, Loader, Stack, Title, Text, Tabs, Button, Grid } from '@mantine/core';
import { cn } from '@/lib/utils';
import { IconCalendarWeek, IconPlus } from '@tabler/icons-react';
import { NotFound } from '@/components/layout/NotFound';
import { toISODateString } from '@/utils/formatDate';
import { useBillsBySpace } from '@/features/bills/hooks/useBill';
import { useDisclosure } from '@mantine/hooks';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BillCard from '@/features/bills/components/details/BillCard';
import dayjs from 'dayjs';
import type { Bill } from '@/features/bills/types/bill';
import { SpaceMenu } from '../components/SpaceMenu';
import { useSpaceFormData } from '../hooks/useSpace';
import SpaceIcon from '../components/SpaceIcon';
import SpaceMembers from '../components/SpaceMembers';

const tabs = ['bills', 'expenses', 'members'];

type Tabs = (typeof tabs)[number];

export default function SpaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const referencePeriod = toISODateString(dayjs().startOf('month'));

  const { data: bills } = useBillsBySpace(Number(id), referencePeriod);

  const [activeTab, setActiveTab] = useState<Tabs>('bills');
  const [isBillFormOpen, { open: openBillForm, close: closeBillForm }] = useDisclosure(false);
  const [selectedBill, setSelectedBill] = useState<Bill | undefined>(undefined);

  // TODO: Add useSpaceOverviewData hook to get the specific reference period data
  const { data: space, isLoading: isLoadingSpace } = useSpaceFormData(Number(id));

  const { formatDate } = useLocalizationFormatters();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces' });

  const handleCloseBillForm = () => {
    setSelectedBill(undefined);
    closeBillForm();
  };

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

          <Tabs
            defaultValue="bills"
            value={activeTab}
            onChange={value => setActiveTab(value as Tabs)}
          >
            <Tabs.List className="text-muted-foreground text-xl">
              {tabs.map(tab => (
                <Tabs.Tab
                  key={tab}
                  value={tab}
                  className={cn('font-medium', activeTab === tab && 'text-primary')}
                >
                  {t(`tabs.${tab}.title`)}
                </Tabs.Tab>
              ))}
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
                <Grid>
                  {bills?.map(bill => (
                    <Grid.Col key={bill.id} span={{ base: 12, md: 4 }}>
                      <BillCard
                        bill={bill}
                        onEdit={bill => {
                          setSelectedBill(bill);
                          openBillForm();
                        }}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
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
          onClose={handleCloseBillForm}
          bill={selectedBill}
          space={space}
        />
      </>
    )
  );
}
