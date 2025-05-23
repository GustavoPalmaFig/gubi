import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { Component, effect, input } from '@angular/core';
import { iUser } from '@features/auth/interfaces/user.interface';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-user-avatar',
  imports: [CommonModule, AvatarModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss'
})
export class UserAvatarComponent {
  public user = input.required<iUser | null>();
  public size = input<'small' | 'normal' | 'large'>();
  protected image: string | undefined;

  protected backgroundColor = '';

  constructor() {
    effect(() => {
      const user = this.user();

      if (user) {
        this.backgroundColor = Utils.stringToColor(user.email);
        this.image = this.getImage();
      }
    });
  }

  protected get initials(): string {
    const user = this.user();
    if (!user) {
      return '';
    }
    const nameParts = user?.fullname.split(' ');
    return nameParts[0][0].toUpperCase();
  }

  protected get sizeClass(): string {
    switch (this.size()) {
      case 'large':
        return '!size-8';
      case 'small':
        return '!size-4';
      default:
        return '!size-6';
    }
  }

  protected getImage(): string | undefined {
    if (this.user()?.avatar_url) {
      return this.user()?.avatar_url;
    }

    return undefined;
  }
}
