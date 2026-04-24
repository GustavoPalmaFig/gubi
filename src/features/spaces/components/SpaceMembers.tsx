import { AppAvatar } from '@/components/shared/AppAvatar';
import { Avatar } from '@mantine/core';
import type { SpaceMember } from '../types/spaceMember';

export default function SpaceMembers({ members }: { members: SpaceMember[] }) {
  return (
    <Avatar.Group>
      {members.map((member, index) =>
        index < 4 ? (
          <AppAvatar
            key={member.user_id}
            user={member.user}
            size="md"
            showName={false}
            showEmail={false}
            className="w-fit justify-start"
          />
        ) : (
          index === members.length - 1 && <Avatar>+{members.length - 4}</Avatar>
        )
      )}
    </Avatar.Group>
  );
}
