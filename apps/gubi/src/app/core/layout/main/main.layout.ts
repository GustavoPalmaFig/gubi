import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LayoutService } from '@core/services/layout.service';
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
  protected readonly layoutService = inject(LayoutService);
}
