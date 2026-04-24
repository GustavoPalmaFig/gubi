import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSpace,
  deleteSpace,
  fetchSpaceFormById,
  fetchSpaceOverview,
  searchUsersForSpace,
  updateSpace
} from '../services/space.service';

const spaceKeys = {
  root: ['space'] as const,
  overview: () => [...spaceKeys.root, 'overview'],
  form: (spaceId: number) => [...spaceKeys.root, spaceId, 'form'],
  usersSearch: (query: string, spaceId: number | null) => [
    ...spaceKeys.root,
    'usersSearch',
    query,
    spaceId
  ]
};

export function useSpaceFormData(id: number) {
  return useQuery({
    queryKey: spaceKeys.form(id),
    queryFn: () => fetchSpaceFormById(id),
    enabled: !!id
  });
}

export function useSpaceOverviewData() {
  return useQuery({
    queryKey: spaceKeys.overview(),
    queryFn: fetchSpaceOverview
  });
}

export function useSearchUsersForSpaceQuery(query: string, spaceId: number | null) {
  return useQuery({
    queryKey: spaceKeys.usersSearch(query, spaceId),
    queryFn: () => searchUsersForSpace(query, spaceId),
    enabled: !!query && query.length > 2
  });
}

function useSpaceMutation<T>(mutateFn: (payload: T) => Promise<void | T | number>) {
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

export function useDeleteSpaceMutation() {
  return useSpaceMutation(deleteSpace);
}
