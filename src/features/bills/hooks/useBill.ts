import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBill,
  deleteBill,
  fetchBillFormById,
  fetchBillsBySpace,
  updateBill
} from '../services/bill.service';

const billKeys = {
  root: ['bill'] as const,
  form: (billId: number) => [...billKeys.root, billId, 'form'] as const,
  bySpace: (spaceId: number) => [...billKeys.root, 'space', spaceId] as const
};

export function useBillFormData(billId: number) {
  return useQuery({
    queryKey: billKeys.form(billId),
    queryFn: () => fetchBillFormById(billId),
    enabled: !!billId
  });
}

export function useBillsBySpace(spaceId: number) {
  return useQuery({
    queryKey: billKeys.bySpace(spaceId),
    queryFn: () => fetchBillsBySpace(spaceId),
    enabled: !!spaceId
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

export function useCreateBillMutation() {
  return useBillMutation(createBill);
}

export function useUpdateBillMutation() {
  return useBillMutation(updateBill);
}

export function useDeleteBillMutation() {
  return useBillMutation(deleteBill);
}
