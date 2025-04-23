import { Component } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-main',
  imports: [RouterModule, HeaderComponent, ConfirmDialogModule],
  templateUrl: './main.layout.html',
  styleUrl: './main.layout.scss',
  providers: [ConfirmationService]
})
export class MainLayout {}
