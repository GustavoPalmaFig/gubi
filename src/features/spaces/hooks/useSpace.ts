import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSpace, fetchSpaceById, updateSpace } from '../services/space.service';
import type { Space } from '../types/space';

const spaceKeys = {
  root: ['space'] as const,
  list: () => [...spaceKeys.root, 'list'],
  id: (spaceId: number) => [...spaceKeys.root, spaceId]
};

export function useSpaceData(id: number) {
  return useQuery({
    queryKey: spaceKeys.id(id),
    queryFn: () => fetchSpaceById(id),
    enabled: !!id
  });
}

function useSpaceMutation(mutateFn: (payload: Space) => Promise<void | number>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutateFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: spaceKeys.root });
    }
  });
}

export function useCreateSpaceMutation() {
  return useSpaceMutation(createSpace);
}

export function useUpdateSpaceMutation() {
  return useSpaceMutation(updateSpace);
}
