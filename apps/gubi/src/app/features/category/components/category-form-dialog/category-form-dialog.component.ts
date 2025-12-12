import { ButtonModule } from 'primeng/button';
import { CategoryApiService } from '@features/category/services/category-api.service';
import { ColorPickerModule } from 'primeng/colorpicker';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, input, Input, Output, signal, WritableSignal } from '@angular/core';
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

  selectedCategory = input<iCategory | null>();

  protected isLoading = signal(false);
  protected showPatternInfo = signal(false);
  protected isEditMode = computed(() => !!this.selectedCategory());
  protected categoryForm: FormGroup;

  constructor() {
    this.categoryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      color_hex: new FormControl('#6b8abc'),
      pattern_matching: new FormControl('')
    });

    effect(() => {
      if (this.isDialogOpen()) {
        this.initializeForm();
      } else {
        this.resetForm();
      }
    });
  }

  private initializeForm() {
    const category = this.selectedCategory();
    if (category && this.categoryForm.untouched) {
      this.categoryForm.addControl('id', new FormControl());
      this.categoryForm.patchValue(category);
    }
  }

  private resetForm() {
    this.categoryForm.removeControl('id');
    this.categoryForm.reset();
  }

  close(): void {
    this.isLoading.set(false);
    this.isDialogOpen.set(false);
    this.categoryForm.reset();
  }

  async handleSubmit(): Promise<void> {
    this.isLoading.set(true);
    const category = this.categoryForm.value;

    const { data, error } = this.isEditMode() ? await this.categoryApiService.updateCategory(category) : await this.categoryApiService.createCategory(category);

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
