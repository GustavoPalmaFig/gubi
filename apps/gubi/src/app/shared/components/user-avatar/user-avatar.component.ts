import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { Component, effect, input } from '@angular/core';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-user-avatar',
  imports: [CommonModule, AvatarModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss'
})
export class UserAvatarComponent {
  name = input.required<string>();
  size = input<'small' | 'normal' | 'large'>();
  image = input<string | null>();

  protected backgroundColor = '';

  constructor() {
    effect(() => {
      this.backgroundColor = Utils.stringToColor(this.name());
    });
  }

  protected get initials(): string {
    const nameParts = this.name().split(' ');
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
    if (this.image()) {
      return this.image() as string;
    }

    return undefined;
  }
}
