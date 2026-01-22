import { AuthService } from '@features/auth/services/auth.service';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { iBill } from '@features/bill/interfaces/bill.interface';
import { iExpense } from '@features/expense/interfaces/expense.interface';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { LayoutService } from '@core/services/layout.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Router } from '@angular/router';
import { SpaceApiService } from '@features/spaces/services/space-api.service';
import { SpendingApiService } from '@features/my-spendings/services/spending-api.service';
import { Timeline } from 'primeng/timeline';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import MySpendingUtils from '@features/my-spendings/utils/utils';
import Utils from '@shared/utils/utils';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LoadingComponent, Timeline, UserAvatarComponent, Button],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePage {
  protected spendingApiService = inject(SpendingApiService);
  protected spaceApiService = inject(SpaceApiService);
  protected authService = inject(AuthService);
  protected layoutService = inject(LayoutService);
  protected router = inject(Router);

  protected billGuard = MySpendingUtils.billGuard;
  protected expenseGuard = MySpendingUtils.expenseGuard;
  protected getusersFromMembers = Utils.getusersFromMembers;

  private userId = this.authService.currentUser()?.id;

  protected isLoading = signal<boolean>(false);
  protected currentPage = signal<number>(1);
  protected totalPages = signal<number>(1);

  protected allSpendings = signal<(iBill | iExpense)[]>([]);

  constructor() {
    effect(() => {
      this.fetchSpendings();
    });
  }

  private async fetchSpendings() {
    this.isLoading.set(true);
    const spaces = await this.spaceApiService.getUserSpaces();
    const spendingsPaginated = await this.spendingApiService.getAllSpendingsPaginated(this.currentPage(), 5);
    this.totalPages.set(Math.max(spendingsPaginated.totalPages || 1));
    this.allSpendings.update(spendings => [...(spendings || []), ...spendingsPaginated.spendings]);
    this.populateSpaces(this.allSpendings(), spaces);
    this.isLoading.set(false);
  }

  private populateSpaces(spendings: (iBill | iExpense)[], spaces: iSpace[]) {
    const spaceMap: Record<string, iSpace> = {};
    spaces.forEach(space => {
      spaceMap[space.id] = space;
    });

    spendings.forEach(spending => {
      spending.space = spaceMap[spending.space_id] || null;
    });
  }

  protected getUserSpending(item: iBill | iExpense): number {
    const { value, space } = item;
    const { members } = space;
    const splits = this.billGuard(item) ? item.bill_splits : item.expense_splits;

    let userValue = value && members?.length ? value / members.length : 0;

    if (splits && splits.length) {
      const userSplit = splits.find(split => split.user_id === this.userId);
      userValue = userSplit ? userSplit.split_value : 0;
    }

    return userValue || 0;
  }

  protected loadMore(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.fetchSpendings();
    }
  }

  protected navigateToSpaces(): void {
    this.router.navigate(['/spaces']);
  }
}
