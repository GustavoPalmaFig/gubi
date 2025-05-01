import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@core/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-main',
  imports: [RouterModule, HeaderComponent, SidebarComponent, ConfirmDialogModule, CommonModule],
  templateUrl: './main.layout.html',
  styleUrl: './main.layout.scss',
  providers: [ConfirmationService]
})
export class MainLayout {
  protected sidebarIsExpanded = signal(false);

  resizeBody(isExpanded: boolean) {
    this.sidebarIsExpanded.set(isExpanded);
  }
}
