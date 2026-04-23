import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSpace,
  fetchSpaceById,
  searchUsersForSpace,
  updateSpace
} from '../services/space.service';
import type { Space } from '../types/space';

const spaceKeys = {
  root: ['space'] as const,
  list: () => [...spaceKeys.root, 'list'],
  id: (spaceId: number) => [...spaceKeys.root, spaceId],
  usersSearch: (query: string, spaceId: number | null) => [
    ...spaceKeys.root,
    'usersSearch',
    query,
    spaceId
  ]
};

export function useSpaceData(id: number) {
  return useQuery({
    queryKey: spaceKeys.id(id),
    queryFn: () => fetchSpaceById(id),
    enabled: !!id
  });
}

export function useSearchUsersForSpaceQuery(query: string, spaceId: number | null) {
  return useQuery({
    queryKey: spaceKeys.usersSearch(query, spaceId),
    queryFn: () => searchUsersForSpace(query, spaceId),
    enabled: !!query && query.length > 2
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
