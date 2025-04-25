import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { iSpace } from '@features/spaces/interfaces/space.interface';
import { MessageService } from '@shared/services/message.service';
import { SpaceService } from '@features/spaces/services/space.service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-space-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, ReactiveFormsModule],
  templateUrl: './space-dialog.component.html',
  styleUrl: './space-dialog.component.scss'
})
export class SpaceDialogComponent {
  private spaceService = inject(SpaceService);
  private messageService = inject(MessageService);

  @Input() visible = false;
  @Input() spaceToEdit: iSpace | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() spaceSaved = new EventEmitter<iSpace>();

  protected isLoading = false;
  protected spaceForm: FormGroup;

  constructor() {
    this.spaceForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.maxLength(255)])
    });
  }

  ngOnChanges(): void {
    if (this.visible && this.spaceToEdit) {
      this.spaceForm.patchValue({
        name: this.spaceToEdit.name,
        description: this.spaceToEdit.description
      });
    } else {
      this.spaceForm.reset();
    }
  }

  close(): void {
    this.isLoading = false;
    this.visibleChange.emit(false);
    this.spaceForm.reset();
  }

  async handleSubmit(): Promise<void> {
    if (this.spaceForm.invalid) {
      if (this.spaceForm.get('description')?.invalid) {
        this.messageService.showMessage('error', 'Erro', 'Descrição muito grande.');
      }
      return;
    }

    this.isLoading = true;
    const { name, description } = this.spaceForm.value;
    const { data, error } =
      this.isEditMode && this.spaceToEdit ? await this.spaceService.updateSpace(this.spaceToEdit.id, name, description) : await this.spaceService.createSpace(name, description);

    if (error) {
      this.messageService.showMessage('error', 'Erro', error);
      this.isLoading = false;
      return;
    }

    this.spaceSaved.emit(data);
    this.close();
  }

  get isEditMode(): boolean {
    return !!this.spaceToEdit;
  }
}
