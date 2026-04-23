import type { User } from '@/features/auth/types/user';
import type { SpaceMember } from '../types/spaceMember';

export function createCurrentUserMember(currentUser: User): SpaceMember {
  return {
    user_id: currentUser.id,
    role: 'owner',
    status: 'active',
    default_split_percentage: null,
    user: currentUser
  };
}

export function getInitialSpaceMembers(
  spaceMembers: SpaceMember[] | undefined,
  currentUser: User | null
) {
  if (!currentUser) {
    return [];
  }

  return spaceMembers && spaceMembers.length > 0
    ? spaceMembers
    : [createCurrentUserMember(currentUser)];
}
