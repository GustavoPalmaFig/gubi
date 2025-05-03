import { Injectable, signal, effect, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly _isMobile = signal<boolean>(window.innerWidth <= 600);
  private readonly _isSidebarExpanded = signal<boolean>(false);
  private readonly _isSidebarOpen = signal<boolean>(true);

  public readonly isMobile = this._isMobile.asReadonly();
  public readonly isSidebarOpen = this._isSidebarOpen.asReadonly();
  public readonly isSidebarExpanded = this._isSidebarExpanded.asReadonly();

  public readonly mainContentClass = computed(() => (this.isMobile() ? 'ml-4' : this.isSidebarExpanded() ? 'ml-48' : 'ml-20'));
  public readonly sidebarClass = computed(() => (this.isMobile() ? '!w-64' : this.isSidebarExpanded() ? '!w-44' : '!w-16'));

  constructor() {
    effect(() => {
      this.isMobileListener();
      this.setupResponsiveBehavior();
    });
  }

  private isMobileListener() {
    window.addEventListener('resize', () => {
      this._isMobile.set(window.innerWidth <= 600);
    });
  }

  private setupResponsiveBehavior(): void {
    this._isSidebarOpen.set(!this._isMobile());
    this._isSidebarExpanded.set(false);
  }

  toggleSidebarVisibility(): void {
    if (this.isMobile()) {
      this._isSidebarOpen.set(!this.isSidebarOpen());
    }
    this._isSidebarExpanded.set(this._isSidebarOpen());
  }

  toggleSidebarExpansion(): void {
    if (this.isMobile()) {
      this._isSidebarOpen.set(false);
    }
    this._isSidebarExpanded.update(expanded => !expanded);
  }

  setIsSidebarOpen(isOpen: boolean): void {
    this._isSidebarOpen.set(isOpen);
  }
}
