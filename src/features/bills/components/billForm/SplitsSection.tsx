import {
  Badge,
  Card,
  CheckIcon,
  Checkbox,
  Divider,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Button
} from '@mantine/core';
import { AppAvatar } from '@/components/shared/AppAvatar';
import { cn } from '@/lib/utils';
import { IconCalculator, IconExclamationCircleFilled } from '@tabler/icons-react';
import { roundValue } from '@/utils/formatNumber';
import { toISODateString } from '@/utils/formatDate';
import { useEffect, useRef, useState } from 'react';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useTranslation } from 'react-i18next';
import AppDatePickerInput from '@/components/shared/AppDatePickerInput';
import AppNumberInput from '@/components/shared/AppNumberInput';
import dayjs from 'dayjs';
import type { SpaceMember } from '@/features/spaces/types/spaceMember';
import SplitSummaryBox from './SplitSummaryBox';
import type { BillSplit } from '../../types/billSplit';

export interface SplitsSectionProps {
  totalValue: number;
  members: SpaceMember[];
  splits: BillSplit[];
  shouldApplyDefaultSplits: boolean;
  onChange: (splits: BillSplit[]) => void;
}

function getSplitPercentages(splits: BillSplit[], totalValue: number): Record<string, number> {
  return splits.reduce<Record<string, number>>((acc, split) => {
    acc[split.user_id] = totalValue > 0 ? roundValue((split.split_value / totalValue) * 100) : 0;
    return acc;
  }, {});
}

function areSplitsEqual(a: BillSplit[], b: BillSplit[]): boolean {
  return (
    a.length === b.length &&
    a.every((split, i) => {
      const other = b[i];
      return (
        split.user_id === other?.user_id &&
        roundValue(split.split_value) === roundValue(other.split_value) &&
        (split.paid_at ?? null) === (other.paid_at ?? null)
      );
    })
  );
}

export default function SplitsSection({
  totalValue,
  members,
  splits,
  shouldApplyDefaultSplits,
  onChange
}: SplitsSectionProps) {
  const { formatCurrency } = useLocalizationFormatters();
  const { t } = useTranslation('translation', { keyPrefix: 'bills.form.splitsSection' });

  const shouldApplyDefaultSplitsRef = useRef(shouldApplyDefaultSplits);

  const [splitPercentages, setSplitPercentages] = useState<Record<string, number>>(() =>
    getSplitPercentages(splits, totalValue)
  );

  const splitPercentagesRef = useRef(splitPercentages);
  splitPercentagesRef.current = splitPercentages;

  // Controla se as porcentagens já foram inicializadas com valores reais.
  // Começa true apenas se já há totalValue > 0 com splits não-zerados (edição síncrona).
  const percentagesInitialized = useRef(totalValue > 0 && splits.some(s => s.split_value > 0));

  const splitTotal = roundValue(splits.reduce((acc, s) => acc + s.split_value, 0));
  const paidTotal = roundValue(splits.reduce((acc, s) => acc + (s.paid_at ? s.split_value : 0), 0));
  const pendingTotal = roundValue(splitTotal - paidTotal);
  const difference = roundValue(totalValue - splitTotal);

  useEffect(() => {
    shouldApplyDefaultSplitsRef.current = shouldApplyDefaultSplits;
  }, [shouldApplyDefaultSplits]);

  useEffect(() => {
    if (percentagesInitialized.current) return;
    if (!totalValue || !splits.some(s => s.split_value > 0)) return;

    percentagesInitialized.current = true;
    const next = getSplitPercentages(splits, totalValue);
    splitPercentagesRef.current = next; // atualização síncrona para o próximo effect
    setSplitPercentages(next);
  }, [totalValue, splits]);

  // Modo automático: aplica os percentuais padrão dos membros quando o total muda
  useEffect(() => {
    if (!shouldApplyDefaultSplitsRef.current || !totalValue) return;

    const membersCount = members.length;
    const fallback = membersCount > 0 ? 100 / membersCount : 0;
    const totalCents = Math.round(totalValue * 100);

    const memberCents = members.map(m =>
      Math.round((totalCents * (m.default_split_percentage ?? fallback)) / 100)
    );

    const roundingDiff = totalCents - memberCents.reduce((s, v) => s + v, 0);
    if (memberCents.length > 0) memberCents[memberCents.length - 1] += roundingDiff;

    const nextSplits = members.map((m, i) => ({
      user_id: m.user.id,
      split_value: memberCents[i] / 100,
      paid_at: splits.find(s => s.user_id === m.user.id)?.paid_at ?? null,
      user: m.user
    }));

    if (areSplitsEqual(nextSplits, splits)) return;
    onChange(nextSplits);
  }, [totalValue, members, splits, onChange]);

  // Modo manual: quando totalValue muda, preserva as porcentagens e recalcula valores.
  useEffect(() => {
    if (shouldApplyDefaultSplitsRef.current || !totalValue) return;

    const nextSplits = splits.map(split => ({
      ...split,
      split_value: roundValue(
        ((splitPercentagesRef.current[split.user_id] ?? 0) / 100) * totalValue
      )
    }));

    if (areSplitsEqual(nextSplits, splits)) return;
    onChange(nextSplits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalValue]);

  const setPercentage = (userId: string, percentage: number) => {
    const next = { ...splitPercentagesRef.current, [userId]: percentage };
    splitPercentagesRef.current = next;
    setSplitPercentages(next);
  };

  const updateSplit = (index: number, patch: Partial<BillSplit>) => {
    shouldApplyDefaultSplitsRef.current = false;
    const next = splits.map((split, i) => (i === index ? { ...split, ...patch } : split));
    onChange(next);
  };

  const handleSplitEqual = () => {
    if (!totalValue || !splits.length) return;

    const totalCents = Math.round(totalValue * 100);
    const base = Math.floor(totalCents / splits.length);
    const remainder = totalCents % splits.length;

    const nextSplits = splits.map((split, i) => ({
      ...split,
      split_value: (base + (i < remainder ? 1 : 0)) / 100
    }));

    const next = getSplitPercentages(nextSplits, totalValue);
    splitPercentagesRef.current = next;
    setSplitPercentages(next);
    shouldApplyDefaultSplitsRef.current = false;
    onChange(nextSplits);
  };

  return (
    <Card radius="lg" padding="lg" shadow="sm" withBorder>
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={4}>{t('sectionTitle')}</Title>

          {totalValue > 0 && (
            <Button
              size="sm"
              variant="outline"
              leftSection={<IconCalculator size={16} />}
              onClick={handleSplitEqual}
            >
              {t('splitEqual')}
            </Button>
          )}
        </Group>

        {totalValue > 0 ? (
          <Stack gap="lg">
            <Group grow>
              <SplitSummaryBox
                label={t('totalValue')}
                value={formatCurrency(totalValue)}
                variant="total"
              />
              <SplitSummaryBox
                label={t('paidValue')}
                value={formatCurrency(paidTotal)}
                variant="paid"
              />
              <SplitSummaryBox
                label={t('pendingValue')}
                value={formatCurrency(pendingTotal)}
                variant="pending"
              />
            </Group>

            <Stack>
              {splits.map((split, index) => (
                <Card
                  key={split.user_id}
                  withBorder
                  className={cn(split.paid_at ? 'bg-primary/5' : 'bg-orange/5')}
                >
                  <Stack>
                    <Group justify="space-between">
                      {split.user && (
                        <AppAvatar user={split.user} size="sm" yourself className="w-fit" />
                      )}
                      {split.paid_at && (
                        <Badge color="primary" variant="light">
                          {t('paid')}
                        </Badge>
                      )}
                    </Group>

                    <Grid>
                      <Grid.Col span={{ base: 12, sm: 5 }}>
                        <AppNumberInput
                          label={t('percentageLabel')}
                          value={splitPercentages[split.user_id] ?? 0}
                          rightSection="%"
                          min={0}
                          max={100}
                          onChange={v => {
                            const percentage = roundValue(Number(v) || 0);
                            setPercentage(split.user_id, percentage);
                            updateSplit(index, {
                              split_value: roundValue((percentage / 100) * totalValue)
                            });
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, sm: 7 }}>
                        <AppNumberInput
                          isCurrency
                          label={t('valueLabel')}
                          value={split.split_value || 0}
                          onChange={v => {
                            const splitValue = roundValue(Number(v) || 0);
                            setPercentage(
                              split.user_id,
                              totalValue > 0 ? roundValue((splitValue / totalValue) * 100) : 0
                            );
                            updateSplit(index, { split_value: splitValue });
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col span={12}>
                        <Group justify="space-between">
                          <Checkbox
                            icon={CheckIcon}
                            label={t('marksAsPaid')}
                            checked={!!split.paid_at}
                            radius="xl"
                            onChange={e =>
                              updateSplit(index, {
                                paid_at: e.currentTarget.checked ? toISODateString(dayjs()) : null
                              })
                            }
                          />

                          {split.paid_at && (
                            <AppDatePickerInput
                              value={split.paid_at}
                              onChange={v => updateSplit(index, { paid_at: v as string | null })}
                              popoverProps={{ position: 'bottom' }}
                              classNames={{ input: 'text-sm' }}
                            />
                          )}
                        </Group>
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Card>
              ))}
            </Stack>

            <Divider />

            <Group justify="space-between">
              <Text className="text-muted-foreground">{t('splitedTotalValue')}</Text>

              <Stack gap={0} align="flex-end">
                <Text>
                  {formatCurrency(splitTotal)} / {formatCurrency(totalValue)}
                </Text>
                {difference !== 0 && (
                  <Badge color="red">
                    {t('differenceSplitedValue')}: {formatCurrency(difference)}
                  </Badge>
                )}
              </Stack>
            </Group>
          </Stack>
        ) : (
          <div className="bg-orange/10 border-orange/20 text-orange flex gap-2 rounded-md border p-2">
            <IconExclamationCircleFilled size={16} />
            <Text size="sm">{t('totalValueRequiredMessage')}</Text>
          </div>
        )}
      </Stack>
    </Card>
  );
}
