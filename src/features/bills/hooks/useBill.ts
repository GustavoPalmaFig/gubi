import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteBill, fetchBillsBySpace, saveBill } from '../services/bill.service';

const billKeys = {
  root: ['bill'] as const,
  bySpace: (spaceId: number, referencePeriod: string) =>
    [...billKeys.root, 'space', spaceId, referencePeriod] as const
};

export function useBillsBySpace(spaceId: number, referencePeriod: string) {
  return useQuery({
    queryKey: billKeys.bySpace(spaceId, referencePeriod),
    queryFn: () => fetchBillsBySpace(spaceId, referencePeriod),
    enabled: !!spaceId && !!referencePeriod
  });
}

function useBillMutation<T>(mutateFn: (payload: T) => Promise<void | number>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutateFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billKeys.root });
    }
  });
}

export function useSaveBillMutation() {
  return useBillMutation(saveBill);
}

export function useDeleteBillMutation() {
  return useBillMutation(deleteBill);
}
