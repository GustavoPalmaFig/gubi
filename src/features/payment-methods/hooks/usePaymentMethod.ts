import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentMethod,
  fetchPaymentMethodOverview,
  deletePaymentMethod,
  updatePaymentMethod
} from '../services/paymenMethod.service';

const paymentMethodOverviewQueryKey = ['payment-method-overview'];

export function usePaymentMethodOverview() {
  return useQuery({
    queryKey: paymentMethodOverviewQueryKey,
    queryFn: fetchPaymentMethodOverview
  });
}

function usePaymentMethodOverviewMutation<T>(mutateFn: (payload: T) => Promise<void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutateFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentMethodOverviewQueryKey });
    }
  });
}

export function useCreatePaymentMethodMutation() {
  return usePaymentMethodOverviewMutation(createPaymentMethod);
}

export function useUpdatePaymentMethodMutation() {
  return usePaymentMethodOverviewMutation(updatePaymentMethod);
}

export function useDeletePaymentMethodMutation() {
  return usePaymentMethodOverviewMutation(deletePaymentMethod);
}
