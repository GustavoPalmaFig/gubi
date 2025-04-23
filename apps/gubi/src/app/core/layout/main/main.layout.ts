import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-main',
  imports: [RouterModule, HeaderComponent],
  templateUrl: './main.layout.html',
  styleUrl: './main.layout.scss'
})
export class MainLayout {}
