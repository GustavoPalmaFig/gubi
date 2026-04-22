import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentMethod,
  fetchPaymentMethodOverview,
  deletePaymentMethod,
  updatePaymentMethod,
  fetchPaymentMethodsWithOwner
} from '../services/paymenMethod.service';

export const paymentMethodRootQueryKey = ['payment-method'];

const paymentMethodKeys = {
  root: paymentMethodRootQueryKey,
  overview: [...paymentMethodRootQueryKey, 'overview'],
  withOwner: [...paymentMethodRootQueryKey, 'with-owner']
};

export function usePaymentMethodOverview() {
  return useQuery({
    queryKey: paymentMethodKeys.overview,
    queryFn: fetchPaymentMethodOverview
  });
}

export function usePaymentMethodsWithOwner() {
  return useQuery({
    queryKey: paymentMethodKeys.withOwner,
    queryFn: fetchPaymentMethodsWithOwner
  });
}

function usePaymentMethodOverviewMutation<T>(mutateFn: (payload: T) => Promise<void | T>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutateFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentMethodKeys.root });
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
