import { ButtonModule } from 'primeng/button';
import { CategoryApiService } from '@features/category/services/category-api.service';
import { ColorPickerModule } from 'primeng/colorpicker';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, WritableSignal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { iCategory } from '@features/category/interfaces/category.interface';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from '@shared/services/message.service';

@Component({
  selector: 'app-category-form-dialog',
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, ColorPickerModule, ReactiveFormsModule],
  templateUrl: './category-form-dialog.component.html',
  styleUrl: './category-form-dialog.component.scss'
})
export class CategoryFormDialogComponent {
  private messageService = inject(MessageService);
  protected categoryApiService = inject(CategoryApiService);

  @Input() isDialogOpen = signal(false);
  @Output() touchCategory = new EventEmitter<iCategory>();

  protected isLoading = signal(false);
  protected showPatternInfo = signal(false);
  protected categoryForm: FormGroup;

  constructor() {
    this.categoryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      color_hex: new FormControl('#6b8abc'),
      pattern_matching: new FormControl('')
    });
  }

  close(): void {
    this.isLoading.set(false);
    this.isDialogOpen.set(false);
    this.categoryForm.reset();
  }

  async handleSubmit(): Promise<void> {
    this.isLoading.set(true);
    const { data, error } = await this.categoryApiService.createCategory(this.categoryForm.value);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading.set(false);
      return;
    }

    this.messageService.showMessage('success', 'Sucesso', 'Categoria criada com sucesso!');
    this.touchCategory.emit(data);
    this.close();
  }

  toggleInfos(info: WritableSignal<boolean>) {
    info.update(value => !value);
  }
}
