import { Injectable, signal, effect, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly _isMobile = signal<boolean>(window.innerWidth <= 600);
  private readonly _isSidebarExpanded = signal<boolean>(false);
  private readonly _isSidebarOpen = signal<boolean>(true);

  public readonly mainContentClass = computed(() => {
    if (this.isMobile) {
      return 'ml-4';
    }
    return this.isSidebarExpanded ? 'ml-48' : 'ml-20';
  });

  public readonly sidebarClass = computed(() => {
    if (this.isMobile) {
      return '!w-64';
    }
    return this.isSidebarExpanded ? '!w-44' : '!w-16';
  });

  constructor() {
    effect(() => {
      this.isMobileListener();
      this.setupResponsiveBehavior();
    });
  }

  private isMobileListener() {
    window.addEventListener('resize', () => {
      this.setIsMobile(window.innerWidth <= 600);
    });
  }

  private setupResponsiveBehavior(): void {
    this.setIsSidebarOpen(!this.isMobile);
    this.setIsSidebarExpanded(false);
  }

  get isMobile() {
    return this._isMobile();
  }

  get isSidebarOpen() {
    return this._isSidebarOpen();
  }

  get isSidebarExpanded() {
    return this._isSidebarExpanded();
  }

  toggleSidebarVisibility(): void {
    if (this.isMobile) {
      this.setIsSidebarOpen(!this.isSidebarOpen);
    }
    this.setIsSidebarExpanded(this.isSidebarOpen);
  }

  toggleSidebarExpansion(): void {
    if (this.isMobile) {
      this.setIsSidebarOpen(false);
    }
    this.setIsSidebarExpanded(!this.isSidebarExpanded);
  }

  setIsMobile(sizeMatches: boolean): void {
    this._isMobile.set(sizeMatches);
  }

  setIsSidebarOpen(open: boolean): void {
    this._isSidebarOpen.set(open);
  }

  setIsSidebarExpanded(expanded: boolean): void {
    this._isSidebarExpanded.set(expanded);
  }
}
