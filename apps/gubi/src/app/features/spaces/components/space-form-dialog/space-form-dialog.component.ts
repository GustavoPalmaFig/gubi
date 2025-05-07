import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from '@shared/services/message.service';
import { SpaceService } from '@features/spaces/services/space.service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-space-form-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, ReactiveFormsModule],
  templateUrl: './space-form-dialog.component.html',
  styleUrl: './space-form-dialog.component.scss'
})
export class SpaceFormDialogComponent {
  protected spaceService = inject(SpaceService);
  private messageService = inject(MessageService);

  protected isDialogOpen = this.spaceService.isFormDialogOpen;
  protected selectedSpace = this.spaceService.selectedSpace;
  protected isEditMode = computed(() => !!this.spaceService.selectedSpace());
  protected isLoading = signal(false);
  protected spaceForm: FormGroup;

  constructor() {
    this.spaceForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('')
    });

    effect(() => this.initializeForm());
  }

  initializeForm() {
    const selectedSpace = this.selectedSpace();

    if (this.isDialogOpen() && selectedSpace) {
      this.spaceForm.patchValue({
        name: selectedSpace.name,
        description: selectedSpace.description
      });
    } else {
      this.spaceForm.reset();
    }
  }

  close(): void {
    this.isLoading.set(false);
    this.spaceService.toggleFormDialog(false);
    this.spaceForm.reset();
  }

  async handleSubmit(): Promise<void> {
    if (this.spaceForm.invalid) return;

    this.isLoading.set(true);
    const { name, description } = this.spaceForm.value;
    const { error } = await this.spaceService.handleFormSubmit(name, description);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading.set(false);
      return;
    }

    this.close();
  }
}
