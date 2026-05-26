import { ActionIcon, Card, Group, Progress, Stack, Text } from '@mantine/core';
import { AppAvatar } from '@/components/shared/AppAvatar';
import { cn } from '@/lib/utils';
import { IconChevronDown, IconSwitch3 } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useTranslation } from 'react-i18next';
import type { BillMemberBreakdown } from '@/features/bills/types/billTabContent';

export function MemberBreakdownCard({
  memberBreakdown
}: {
  memberBreakdown: BillMemberBreakdown[];
}) {
  const [expanded, { toggle }] = useDisclosure(false);

  const { formatCurrency, formatValue } = useLocalizationFormatters();
  const { t } = useTranslation('translation', { keyPrefix: 'spaces.tabs.bills.memberBreakdown' });

  const visibleMemberBreakdown = expanded ? memberBreakdown : memberBreakdown.slice(0, 1);

  return (
    <Card radius="lg" padding="lg" shadow="md" className="relative min-h-36">
      <Stack gap="0" pb={expanded ? 'md' : '0'}>
        <Group align="center" justify="space-between">
          <Text className="text-foreground/80 font-medium">{t('title')}</Text>
          <IconSwitch3 className="text-cyan size-5" />
        </Group>

        <Stack mt="xs">
          {visibleMemberBreakdown.map(member => (
            <Stack key={member.user.id} gap="0">
              <Group align="center" gap="xs">
                <AppAvatar
                  size="sm"
                  user={member.user}
                  showName={false}
                  showEmail={false}
                  yourself
                  className="w-fit"
                />

                <Stack gap="0">
                  <Text className="text-foreground/80 font-medium">{member.user.full_name}</Text>
                  <Text className="text-muted-foreground text-xs font-medium">
                    {t('paidAndTotalValues', {
                      paidValue: formatCurrency(member.paidValue),
                      totalValue: formatCurrency(member.totalValue)
                    })}
                  </Text>
                </Stack>

                <Text className="mt-auto ml-auto text-sm font-bold">
                  {formatValue(member.paidPercentage)}%
                </Text>
              </Group>

              <Progress value={member.paidPercentage} color="positive" className="my-1" />
              {member.pendingValue > 0 && (
                <Text className="text-orange text-xs font-bold">
                  {t('pendingValue', { pendingValue: formatCurrency(member.pendingValue) })}
                </Text>
              )}
            </Stack>
          ))}
        </Stack>
      </Stack>

      <ActionIcon
        variant="white"
        onClick={toggle}
        className={cn('absolute bottom-1 left-1/2 -translate-x-1/2 self-center p-0')}
      >
        <IconChevronDown size={16} stroke={2} className={cn(expanded && 'rotate-180')} />
      </ActionIcon>
    </Card>
  );
}
