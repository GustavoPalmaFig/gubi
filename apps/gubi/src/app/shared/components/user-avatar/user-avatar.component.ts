import { Avatar } from 'primeng/avatar';
import { AvatarGroup } from 'primeng/avatargroup';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { iUser } from '@features/auth/interfaces/user.interface';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-user-avatar',
  imports: [CommonModule, Avatar, AvatarGroup],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss'
})
export class UserAvatarComponent {
  public users = input.required<iUser | iUser[] | null>();
  public size = input<'small' | 'normal' | 'large' | 'extra-large'>();

  protected get usersArray(): iUser[] {
    const users = this.users();
    if (!users) return [];
    return Array.isArray(users) ? users : [users];
  }

  protected getBackgroundColor(user: iUser): string | undefined {
    return user.avatar_url ? undefined : Utils.stringToColor(user.email);
  }

  protected getInitials(user: iUser): string | undefined {
    if (user.avatar_url) return undefined;

    const nameParts = user?.fullname.split(' ');
    return nameParts[0][0].toUpperCase();
  }

  protected getImage(user: iUser): string | undefined {
    return user.avatar_url || undefined;
  }

  protected get sizeClass(): string {
    switch (this.size()) {
      case 'extra-large':
        return '!size-10';
      case 'large':
        return '!size-8';
      case 'small':
        return '!size-4';
      default:
        return '!size-6';
    }
  }
}
