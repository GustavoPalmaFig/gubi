import { inject, Injectable } from '@angular/core';
import { MessageService as PrimeNGMessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageService = inject(PrimeNGMessageService);

  public showMessage(severity: 'success' | 'error' | 'warn', summary: string, detail: string, life = 10000): void {
    this.messageService.add({ severity, summary, detail, life: life });
  }
}
